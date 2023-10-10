using API.DataTransferObjects;

namespace API.Validators.SessionValidator
{
    public interface ISessionValidator
    {
        bool ValidateLogin(LoginSessionDTO data, List<string> messages);
    }
}
