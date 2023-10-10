using API.Attributes;
using API.Data.Models;
using API.Services;
using API.Utils;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;
using System.Net;
using System.Security.Claims;

namespace API.Middlewares
{
    public class AuthorizationMiddleware
    {
        private readonly RequestDelegate _next;

        public AuthorizationMiddleware(RequestDelegate next)
        {
            this._next = next;
        }

        public async Task Invoke(HttpContext context, ISessionService sessionService)
        { 
            Endpoint? endpoint = context.Features.Get<IEndpointFeature>()?.Endpoint;
            AuthorizeAttribute? authorize = endpoint?.Metadata.GetMetadata<AuthorizeAttribute>();

            if(authorize != null)
            { 
                if(!context.Request.Headers.TryGetValue("Authorization", out StringValues token))
                { 
                    SendResponse(context, HttpStatusCode.BadRequest, data: "Authorization header no present");
                    return;
                }

                try
                { 
                    List<Claim> claims = Token.GetValidTokenClaims(token.ToString().Split(" ")[1], true);
                    Guid sessionId = Guid.Parse(claims.First(c => c.Type == Claims.Session).Value); 

                    Session? session = await sessionService.FindSession(sessionId);
                    if(session == null)
                    { 
                        SendResponse(context, HttpStatusCode.Unauthorized, "Su sesión ha expirado. Debe reingresar al sistema");
                        return;
                    }

                    UserRole[] roles = authorize.Roles;
                    if(!session.User.IsSuperAdmin && roles.Any() && !roles.Contains((UserRole)session.User.RoleId))
                    { 
                        SendResponse(context, HttpStatusCode.Forbidden, "No está autorizado para realizar esta acción");
                        return;
                    }

                    if(session.DateExpiry <= DateTime.Now)
                    { 
                        try 
                        {
                            await sessionService.DeleteSession(session);
                        }
                        catch(DbUpdateConcurrencyException)
                        { 
                            //Log Informativo
                        }

                        SendResponse(context, HttpStatusCode.Unauthorized, "Su sesión ha expirado. Debe reingresar al sistema");
                        return;
                    }

                    context.Items.Add(Claims.UserId, session.UserId);
                    context.Items.Add(Claims.RoleId, session.User.RoleId);
                    context.Items.Add(Claims.Session, session.SessionId);
                    context.Items.Add(Claims.SuperAdmin, session.User.IsSuperAdmin);
                }
                catch(SecurityTokenExpiredException)
                { 
                    context.Response.Headers.Add(ResponseHeaders.AccessTokenExpired, "true");
                    SendResponse(context, HttpStatusCode.Unauthorized, "Su sesión ha expirado");
                    return;
                }
                catch(SecurityTokenException)
                { 
                    SendResponse(context, HttpStatusCode.Unauthorized, "Su sesión no es válida. Debe reingresar al sistema", "Invalid access token");
                    return;
                }
            }

            await this._next.Invoke(context);
        }

        private static async void SendResponse(HttpContext context, HttpStatusCode code, string? message = null, object? data = null)
        { 
            APIResponse response = new()
            { 
                Success = false,
                StatusCode = code,
                Data = data
            };

            if(!string.IsNullOrEmpty(message))
            { 
                response.Messages.Add(message);
            }

            context.Response.StatusCode = (int)code;
            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
