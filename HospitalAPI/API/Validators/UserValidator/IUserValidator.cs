﻿using API.DataTransferObjects;

namespace API.Validators.UserValidator
{
    public interface IUserValidator
    {
        bool ValidateInsert(InsertUpdateUserDTO data, List<string> messages);
        bool ValidateUpdate(int id, InsertUpdateUserDTO data, bool isSuperAdmin, List<string> messages);
        bool ValidateDelete(int id, bool isSuperAdmin, List<string> messages);
        bool ValidateUpdateSelf(int id, UpdateSelfUserDTO data, List<string> messages);

    }
}
