using API.Data.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace API.Utils
{
    public static class Token
    {
        public static string IssueAccessToken(User user, Guid session)
        { 
            List<Claim> claims = new()
            { 
                new Claim(Claims.IssueDate, DateTimeOffset.Now.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                new Claim(Claims.UserId, user.Id.ToString(), ClaimValueTypes.Integer),
                new Claim(Claims.User, user.Email, ClaimValueTypes.String),
                new Claim(Claims.Session, session.ToString(), ClaimValueTypes.String),
                new Claim(Claims.RoleId, user.RoleId.ToString(), ClaimValueTypes.Integer),
                new Claim(Claims.Role, user.Role.Name, ClaimValueTypes.String),
                new Claim(Claims.SuperAdmin, user.IsSuperAdmin.ToString(), ClaimValueTypes.Boolean)
            };

            SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(Configuration.Get<string>("JWT:Secret")));
            JwtSecurityToken token = new(
                issuer: Configuration.Get<string>("JWT:Issuer"),
                audience: Configuration.Get<string>("JWT:Audience"),
                expires: DateTime.UtcNow.AddMinutes(Configuration.Get<int>("JWT:AccessExpirationMinutes")),
                claims: claims,
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public static string IssueRefreshToken(User user, Guid session)
        {
            List<Claim> claims = new()
            {
                new Claim(Claims.IssueDate, DateTimeOffset.Now.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                new Claim(Claims.UserId, user.Id.ToString(), ClaimValueTypes.Integer),
                new Claim(Claims.User, user.Email, ClaimValueTypes.String),
                new Claim(Claims.Session, session.ToString(), ClaimValueTypes.String),
            };

            SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(Configuration.Get<string>("JWT:Secret")));
            JwtSecurityToken token = new(
                issuer: Configuration.Get<string>("JWT:Issuer"),
                audience: Configuration.Get<string>("JWT:Audience"),
                claims: claims,
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public static List<Claim> GetValidTokenClaims(string jwtToken, bool validateExpiration)
        { 
            SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(Configuration.Get<string>("JWT:Secret")));
            TokenValidationParameters validation = new()
            { 
                ValidateIssuer = true,
                ValidIssuer = Configuration.Get<string>("JWT:Issuer"),
                ValidateAudience = true,
                ValidAudience = Configuration.Get<string>("JWT:Audience"),
                RequireExpirationTime = validateExpiration,
                ValidateLifetime = validateExpiration,
                RequireSignedTokens = true,
                IssuerSigningKey = key
            };

            if(validateExpiration)
            {
                validation.ClockSkew = TimeSpan.FromMinutes(Configuration.Get<int>("JWT:ClockSkewMinutes"));
            }

            ClaimsPrincipal claims = new JwtSecurityTokenHandler().ValidateToken(jwtToken, validation, out _);

            return claims.Claims.ToList();
        }
    }
}
