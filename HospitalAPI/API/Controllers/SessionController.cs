﻿using API.Attributes;
using API.Data.Filters;
using API.Data.Models;
using API.DataTransferObjects;
using API.Services;
using API.Utils;
using API.Validators.SessionValidator;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace API.Controllers
{
    [Route("api/sessions")]
    [ApiController]
    public class SessionController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ISessionService _sessionService;
        private readonly IUserService _userService;
        private readonly ISessionValidator _sessionValidator;

        public SessionController(IMapper mapper, ISessionService sessionService, IUserService userService, ISessionValidator sessionValidator)
        {
            this._mapper = mapper;
            this._sessionService = sessionService;
            this._userService = userService;
            this._sessionValidator = sessionValidator;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<APIResponse>> ListSessions([FromQuery] FilterSessionDTO data)
        { 
            SessionFilters filter = this._mapper.Map<FilterSessionDTO, SessionFilters>(data);
            List<Session> list = await this._sessionService
                                        .ListSessions(Convert.ToInt32(HttpContext.Items[Claims.UserId]), filter)
                                        .ToListAsync();

            APIResponse response = new()
            { 
                Data = list.Select(s => this._mapper.Map<Session, GetSessionDTO>(s))
            };

            return response;
        }

        [HttpPost]
        public async Task<ActionResult<APIResponse>> LogIn(LoginSessionDTO data)
        {
            APIResponse response = new();
            response.Success = this._sessionValidator.ValidateLogin(data, response.Messages);

            if (response.Success)
            {
                User? user = await this._userService.FindUser(data.Email!);
                if (user == null || Convert.ToHexString(Crypter.Hash(data.Password!, user.PasswordSalt, Configuration.Get<int>("Cryptography:SaltLength"))) != Convert.ToHexString(user.Password))
                {
                    return HttpErrors.NotFound("Usuario y contraseña incorrectos");
                }

                Session session = await this._sessionService.InitUserSession(user, Request.HttpContext.Connection.RemoteIpAddress);
                response.Data = this._mapper.Map<Session, GetSessionTokensDTO>(session);
            }

            return response;
        }

        [HttpPatch]
        public async Task<ActionResult<APIResponse>> RefreshSession()
        {
            try
            {
                if (!Request.Headers.TryGetValue("Session", out StringValues tokenHeader))
                {
                    return HttpErrors.BadRequest(data: "Session header not present");
                }

                string token = tokenHeader.ToString().Split(" ")[1];
                List<Claim> claims = Token.GetValidTokenClaims(token, false);
                Guid sessionId = Guid.Parse(claims.First(c => c.Type == Claims.Session).Value);

                string salt = Configuration.Get<string>("Authentication:RefreshTokenSalt");
                byte[] tokenHash = Crypter.Hash(token, Encoding.UTF8.GetBytes(salt), Configuration.Get<int>("Cryptography:SaltLength"));

                Session? session = await this._sessionService.FindSession(sessionId);
                if (session == null || Convert.ToHexString(session.RefreshToken) != Convert.ToHexString(tokenHash))
                {
                    return HttpErrors.Unauthorized("Su sesión ha expirado", "Refresh token reused or not valid");
                }

                if (session.DateExpiry <= DateTime.Now)
                {
                    await this._sessionService.DeleteSession(session);
                    return HttpErrors.Unauthorized("Su sesión ha expirado");
                }

                await this._sessionService.RefreshUserSession(session.User, session, Request.HttpContext.Connection.RemoteIpAddress);

                APIResponse response = new()
                {
                    Data = this._mapper.Map<Session, GetSessionTokensDTO>(session)
                };

                return response;
            }
            catch (SecurityTokenException)
            {
                return HttpErrors.BadRequest(data: "Refresh token is not valid");
            }

        }

        [HttpDelete]
        [Route("{sessionId?}")]
        [Authorize]
        public async Task<ActionResult<APIResponse>> LogOut(Guid? sessionId = null)
        {
            Session? session = await this._sessionService.FindSession(sessionId ?? Guid.Parse(Convert.ToString(this.HttpContext.Items[Claims.Session])!));
            if (session == null || session.UserId != Convert.ToInt32(HttpContext.Items[Claims.UserId]))
            {
                return HttpErrors.NotFound("Sesión no existe en el sistema");
            }

            await this._sessionService.DeleteSession(session);

            APIResponse response = new()
            {
                Data = this._mapper.Map<Session, GetSessionDTO>(session),
                Messages = new() { "Sesión ha sido eliminada" }
            };

            return response;
        }
    }
}
