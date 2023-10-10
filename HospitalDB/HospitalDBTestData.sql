USE HospitalDB;
GO

DECLARE @GenderMasculineId INT;
SELECT TOP 1 @GenderMasculineId = Id FROM Gender WHERE Name = 'Masculino';

DECLARE @GenderFeminineId INT;
SELECT TOP 1 @GenderFeminineId = Id FROM Gender WHERE Name = 'Femenino';

DECLARE @GeneralDoctorId INT;
SELECT TOP 1 @GeneralDoctorId = Id FROM Field WHERE Name = 'Doctor General';

DECLARE @DentistDoctorId INT;
SELECT TOP 1 @DentistDoctorId = Id FROM Field WHERE Name = 'Dentista';

DECLARE @SurgeonDoctorId INT;
SELECT TOP 1 @SurgeonDoctorId = Id FROM Field WHERE Name = 'Cirujano';

DECLARE @PediatricianDoctorId INT;
SELECT TOP 1 @PediatricianDoctorId = Id FROM Field WHERE Name = 'Pediatra';

DECLARE @AdministradorId INT;
SELECT TOP 1 @AdministradorId = Id FROM [Role] WHERE Name = 'Administrador';

DECLARE @EditorId INT;
SELECT TOP 1 @EditorId = Id FROM [Role] WHERE Name = 'Editor';

DECLARE @AsistenteId INT;
SELECT TOP 1 @AsistenteId = Id FROM [Role] WHERE Name = 'Asistente';

-- INSERT PATIENTS
IF NOT EXISTS (SELECT * FROM Patient WHERE DocumentId = '123456789')
BEGIN
	INSERT INTO Patient (DocumentId, FirstName, LastName, BirthDate, GenderId) VALUES ('123456789', 'Paciente', 'Uno', '1992-01-30 11:00:00.000', @GenderMasculineId);
END
DECLARE @PatientId1 INT;
SELECT TOP 1 @PatientId1 = Id FROM Patient WHERE DocumentId = '123456789';

IF NOT EXISTS (SELECT * FROM Patient WHERE DocumentId = '234567890')
BEGIN
	INSERT INTO Patient (DocumentId, FirstName, LastName, BirthDate, GenderId) VALUES ('234567890', 'Paciente', 'Dos', '1990-05-11 15:00:00.000', @GenderFeminineId);
END
DECLARE @PatientId2 INT;
SELECT TOP 1 @PatientId2 = Id FROM Patient WHERE DocumentId = '234567890';

IF NOT EXISTS (SELECT * FROM Patient WHERE DocumentId = '345678901')
BEGIN
	INSERT INTO Patient (DocumentId, FirstName, LastName, BirthDate, GenderId) VALUES ('345678901', 'Paciente', 'Tres', '2005-06-01 00:00:00.000', @GenderMasculineId);
END
DECLARE @PatientId3 INT;
SELECT TOP 1 @PatientId3 = Id FROM Patient WHERE DocumentId = '345678901';

IF NOT EXISTS (SELECT * FROM Patient WHERE DocumentId = '456789012')
BEGIN
	INSERT INTO Patient (DocumentId, FirstName, LastName, BirthDate, GenderId) VALUES ('456789012', 'Paciente', 'Cuatro', '2010-12-01 10:45:00.000', @GenderFeminineId);
END
DECLARE @PatientId4 INT;
SELECT TOP 1 @PatientId4 = Id FROM Patient WHERE DocumentId = '456789012';

-- INSERT DOCTORS
IF NOT EXISTS (SELECT * FROM Doctor WHERE DocumentId = '524857652')
BEGIN
	INSERT INTO Doctor (DocumentId, FirstName, LastName, FieldId) VALUES ('524857652', 'Doctor', 'General', @GeneralDoctorId);
END
DECLARE @DoctorId1 INT;
SELECT TOP 1 @DoctorId1 = Id FROM Doctor WHERE DocumentId = '524857652';

IF NOT EXISTS (SELECT * FROM Doctor WHERE DocumentId = '547412586')
BEGIN
	INSERT INTO Doctor (DocumentId, FirstName, LastName, FieldId) VALUES ('547412586', 'Doctor', 'Dentista', @DentistDoctorId);
END
DECLARE @DoctorId2 INT;
SELECT TOP 1 @DoctorId2 = Id FROM Doctor WHERE DocumentId = '547412586';

IF NOT EXISTS (SELECT * FROM Doctor WHERE DocumentId = '125846589')
BEGIN
	INSERT INTO Doctor (DocumentId, FirstName, LastName, FieldId) VALUES ('125846589', 'Doctor', 'Cirujano', @SurgeonDoctorId);
END
DECLARE @DoctorId3 INT;
SELECT TOP 1 @DoctorId3 = Id FROM Doctor WHERE DocumentId = '125846589';

IF NOT EXISTS (SELECT * FROM Doctor WHERE DocumentId = '352485412')
BEGIN
	INSERT INTO Doctor (DocumentId, FirstName, LastName, FieldId) VALUES ('352485412', 'Doctor', 'Pediatra', @PediatricianDoctorId);
END
DECLARE @DoctorId4 INT;
SELECT TOP 1 @DoctorId4 = Id FROM Doctor WHERE DocumentId = '352485412';

-- INSERT APPOINTMENTS
IF NOT EXISTS (SELECT * FROM Appointment WHERE PatientId = @PatientId1 AND DoctorId = @DoctorId1)
BEGIN
	INSERT INTO Appointment (Date, PatientId, DoctorId) VALUES ('2021-01-02 11:00:00.000', @PatientId1, @DoctorId1);
END

IF NOT EXISTS (SELECT * FROM Appointment WHERE PatientId = @PatientId2 AND DoctorId = @DoctorId4)
BEGIN
	INSERT INTO Appointment (Date, PatientId, DoctorId) VALUES ('2021-01-02 15:30:00.000', @PatientId2, @DoctorId4);
END

IF NOT EXISTS (SELECT * FROM Appointment WHERE PatientId = @PatientId3 AND DoctorId = @DoctorId3)
BEGIN
	INSERT INTO Appointment (Date, PatientId, DoctorId) VALUES ('2020-12-20 20:45:00.000', @PatientId3, @DoctorId3);
END

-- INSERT USERS (Passwords generados con PBKDF2 utilizando SHA512 con 10234 iteraciones. Password es: 123)
IF NOT EXISTS (SELECT * FROM [User] WHERE Email = 'test@admin.com')
BEGIN
	INSERT INTO [User] (Email, Password, PasswordSalt, FirstName, LastName, RoleId) 
		VALUES ('test@admin.com',
	 		0x44C85BEBCCD4DF94D2436E97B0125EF832A4BBBC99AE99B6C42EC722E2BF882821D3A7F2BDCBBF1EC3CE358EE625435F811B0E20D54DEA8E80BC28CA9D154EEC, 
			0x15FBBCD77D6E2D6BEFA7B912676D61A2B6F59003BA6889003121A8757C7486570FC683C8472422EF970F4DC15BCD3A30F09A776BDCE2430425C1F61B24578D38, 
			'Julio', 'Cesar', @AdministradorId);
END

IF NOT EXISTS (SELECT * FROM [User] WHERE Email = 'test@editor.com')
BEGIN
	INSERT INTO [User] (Email, Password, PasswordSalt, FirstName, LastName, RoleId) 
		VALUES ('test@editor.com', 
			0xDDAF4C6F3BD83B7E49719419A62F7456A93481CF71B947FB5850C83EF80C6E0BE2274A74BF6CD8598A75AAD2622B069A6D8B0A3D0540B0C18901C5EF34E94E21,
			0xDBD10F8B2A5D6C68C5CFD4D02DA7B1A88D178353F35B25C1307A5ECFC549D58842BA462F37D46FDDAF7CAB043023322B626853DE0DB0A0BD51DE76DCF72A0F13,
			'Marco', 'Aurelio', @EditorId);
END

IF NOT EXISTS (SELECT * FROM [User] WHERE Email = 'test@assistant.com')
BEGIN
	INSERT INTO [User] (Email, Password, PasswordSalt, FirstName, LastName, RoleId) 
		VALUES ('test@assistant.com', 
		0x355C9C3D3A566C90D11DF01662D06311BD54E1208A6B813FFC9A4CE5A4A98C7A058BDEDBE5EB6074DCDC0E8E2FDA4478DDBB97260DC2A0D18E8F8F2519BA4991,
		0xB016BD5A9DE31DA730DD834E22A8593160C5CB7662159A8027AA4F991ACB0D5EA5D17D29929AEAD22B25F3F04C29446E8EE8A8F0F2C49432E1C37D40B08F722D,
		'Marco', 'Trajano', @AsistenteId);
END