using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using hrms_api.DTOs;
using hrms_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace hrms_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _users;
    private readonly SignInManager<AppUser> _signIn;
    private readonly IConfiguration _config;

    public AuthController(UserManager<AppUser> users, SignInManager<AppUser> signIn, IConfiguration config)
    {
        _users = users; _signIn = signIn; _config = config;
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = new AppUser { FullName = dto.FullName, UserName = dto.Email, Email = dto.Email, Role = dto.Role };
        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);
        await _users.AddToRoleAsync(user, dto.Role);
        return Ok(new { message = "User registered successfully" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _users.FindByEmailAsync(dto.Email);
        if (user == null) return Unauthorized(new { message = "Invalid credentials" });
        var result = await _signIn.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded) return Unauthorized(new { message = "Invalid credentials" });
        var token = GenerateToken(user);
        var refresh = Guid.NewGuid().ToString("N");
        return Ok(new AuthResponseDto(token, refresh, user.FullName, user.Email!, user.Role, user.EmployeeId));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var user = await _users.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email)!);
        if (user == null) return Unauthorized();
        return Ok(new { user.FullName, user.Email, user.Role, user.EmployeeId });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var user = await _users.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email)!);
        if (user == null) return Unauthorized();
        var result = await _users.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded) return BadRequest(result.Errors);
        return Ok(new { message = "Password changed successfully" });
    }

    private string GenerateToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
