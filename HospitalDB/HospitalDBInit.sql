IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'HospitalDB')
BEGIN
	CREATE DATABASE HospitalDB;
END
GO

USE HospitalDB;
GO

-- CREATE FIELD
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name = 'Field' and xtype = 'U')
BEGIN
	CREATE TABLE Field (
		Id INT NOT NULL,
		Name VARCHAR(50) NOT NULL,
		CONSTRAINT PKField PRIMARY KEY (Id)
	)
END
GO

-- CREATE DOCTOR
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name = 'Doctor' and xtype = 'U')
BEGIN
	CREATE TABLE Doctor (
		Id INT NOT NULL IDENTITY(1,1),
		DocumentId VARCHAR(9) NOT NULL,
		FirstName VARCHAR(50) NOT NULL,
		LastName VARCHAR(50) NOT NULL,
		FieldId INT NOT NULL,
		CONSTRAINT PKDoctor PRIMARY KEY (Id),
		CONSTRAINT UXDoctorDocumentId UNIQUE (DocumentId),
		CONSTRAINT FKFieldDoctorFieldId FOREIGN KEY (FieldId) REFERENCES Field (Id)
	)
END
GO

-- CREATE GENDER
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name = 'Gender' and xtype = 'U')
BEGIN
	CREATE TABLE Gender (
		Id INT NOT NULL,
		Name VARCHAR(50) NOT NULL,
		CONSTRAINT PKGender PRIMARY KEY (Id)
	)
END
GO

-- CREATE PATIENT
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name = 'Patient' and xtype = 'U')
BEGIN
	CREATE TABLE Patient (
		Id INT NOT NULL IDENTITY(1,1),
		DocumentId VARCHAR(9) NOT NULL,
		FirstName VARCHAR(50) NOT NULL,
		LastName VARCHAR(50) NOT NULL,
		BirthDate DATETIME2(7) NOT NULL,
		GenderId INT NOT NULL
		CONSTRAINT PKPatient PRIMARY KEY (Id),
		CONSTRAINT UXPatientDocumentId UNIQUE (DocumentId),
		CONSTRAINT FKGenderPatientGenderId FOREIGN KEY (GenderId) REFERENCES Gender (Id)
	)
END
GO

-- CREATE APPOINTMENT
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name = 'Appointment' and xtype = 'U')
BEGIN
	CREATE TABLE Appointment (
		Id INT NOT NULL IDENTITY(1,1),
		Date DATETIME2(7) NOT NULL,
		PatientId INT NOT NULL,
		DoctorId INT NOT NULL,
		CONSTRAINT PKAppointment PRIMARY KEY (Id),
		CONSTRAINT FKPatientAppointmentPatientId FOREIGN KEY (PatientId) REFERENCES Patient (Id),
		CONSTRAINT FKDoctorAppointmentDoctorId FOREIGN KEY (DoctorId) REFERENCES Doctor (Id)
	)
END
GO

-- CREATE ROLE
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name = 'Role' and xtype = 'U')
BEGIN
	CREATE TABLE [Role] (
		Id INT NOT NULL,
		Name VARCHAR(50) NOT NULL,
		CONSTRAINT PKRole PRIMARY KEY (Id)
	)
END
GO

-- CREATE USER
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name = 'User' and xtype = 'U')
BEGIN
	CREATE TABLE [User] (
		Id INT NOT NULL IDENTITY(1, 1),
		Email VARCHAR(100) NOT NULL,
		Password BINARY(64) NOT NULL,
		PasswordSalt BINARY(64) NOT NULL,
		FirstName VARCHAR(50) NOT NULL,
		LastName VARCHAR(50) NOT NULL,
		RoleId INT NOT NULL,
		IsSuperAdmin BIT NOT NULL CONSTRAINT DFUserIsSuperAdmin DEFAULT 0,
		CONSTRAINT PKUser PRIMARY KEY (Id),
		CONSTRAINT UXUserEmail UNIQUE (Email),
		CONSTRAINT FKRoleUserRoleId FOREIGN KEY (RoleId) REFERENCES [Role](Id)
	)
END
GO

-- CREATE SESSION
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name = 'Session' and xtype = 'U')
BEGIN
	CREATE TABLE [Session] (
		Id BIGINT NOT NULL IDENTITY(1, 1),
		SessionId UNIQUEIDENTIFIER NOT NULL,
		UserId INT NOT NULL,
		DateIssued DATETIME2(7) NOT NULL,
		DateRefreshed DATETIME2(7) NULL,
		DateExpiry DATETIME2(7) NOT NULL,
		AddressIssued VARCHAR(40) NOT NULL,
		AddressRefreshed VARCHAR(40) NULL,
		RefreshToken BINARY(64) NOT NULL,
		CONSTRAINT PKSession PRIMARY KEY (Id),
		CONSTRAINT UXSessionId UNIQUE (SessionId),
		CONSTRAINT FKUserSessionUserId FOREIGN KEY (UserId) REFERENCES [User](Id)
	)
END
GO

-- INSERT FIELD DATA
IF NOT EXISTS (SELECT * FROM Field WHERE Name = 'Doctor General')
BEGIN
	INSERT INTO Field (Id, Name) VALUES (1, 'Doctor General');
END

IF NOT EXISTS (SELECT * FROM Field WHERE Name = 'Dentista')
BEGIN
	INSERT INTO Field (Id, Name) VALUES (2, 'Dentista');
END

IF NOT EXISTS (SELECT * FROM Field WHERE Name = 'Pediatra')
BEGIN
	INSERT INTO Field (Id, Name) VALUES (3, 'Pediatra');
END

IF NOT EXISTS (SELECT * FROM Field WHERE Name = 'Cirujano')
BEGIN
	INSERT INTO Field (Id, Name) VALUES (4, 'Cirujano');
END

-- INSERT GENDER DATA
IF NOT EXISTS (SELECT * FROM Gender WHERE Name = 'Femenino')
BEGIN
	INSERT INTO Gender(Id, Name) VALUES (1, 'Femenino');
END

IF NOT EXISTS (SELECT * FROM Gender WHERE Name = 'Masculino')
BEGIN
	INSERT INTO Gender (Id, Name) VALUES (2, 'Masculino');
END

-- INSERT ROLE DATA
IF NOT EXISTS (SELECT * FROM [Role] WHERE Name = 'Administrador')
BEGIN
	INSERT INTO [Role](Id, Name) VALUES (1, 'Administrador');
END

IF NOT EXISTS (SELECT * FROM [Role] WHERE Name = 'Editor')
BEGIN
	INSERT INTO [Role](Id, Name) VALUES (2, 'Editor');
END

IF NOT EXISTS (SELECT * FROM [Role] WHERE Name = 'Asistente')
BEGIN
	INSERT INTO [Role](Id, Name) VALUES (3, 'Asistente');
END