using System.CommandLine;
using System.CommandLine.NamingConventionBinder;
using System.Security.Cryptography;
using System.Text;

namespace Crypter
{
    internal static class HashCommand
    {
        private enum SaltFormat
        { 
            text = 1,
            hex,
            base64
        };

        public static Command CreateCommand()
        { 
            Option saltOption = new Option<string>("--salt", "El valor para utilizar como sal de hashing (ignora --salt-length)")
            { 
                IsRequired = false
            };

            saltOption.AddAlias("-s");

            Option saltFormatOption = new Option<SaltFormat>("--salt-format", "El formato del valor proporcionado en --salt")
            { 
                IsRequired = false
            };

            saltFormatOption.AddAlias("-f");
            saltFormatOption.SetDefaultValue(SaltFormat.text);

            Option saltLengthOption = new Option<int>("--salt-length", "La cantidad de bytes aleatorios para generar una sal de hashing")
            { 
                IsRequired = false
            };

            saltLengthOption.AddAlias("-l");
            saltLengthOption.SetDefaultValue(64);

            Option iterationsOption = new Option<int>("--iterations", "La cantidad de iteraciones de hashing a realizar")
            { 
                IsRequired = false
            };

            iterationsOption.AddAlias("-i");
            iterationsOption.SetDefaultValue(1000);

            Option bytesOption = new Option<int>("--bytes", "La cantidad de bytes del hash resultante")
            { 
                IsRequired = false
            };

            bytesOption.AddAlias("-b");
            bytesOption.SetDefaultValue(64);

            Argument inputArgument = new Argument<string>("input", "El valor base para crear el hash");

            Command hashCommand = new("hash")
            { 
                Description = "Crea un hash a partir de la función criptográfica PBKDF2 con el algoritmo SHA512"
            };

            hashCommand.AddArgument(inputArgument);
            hashCommand.AddOption(saltOption);
            hashCommand.AddOption(saltFormatOption);
            hashCommand.AddOption(saltLengthOption);
            hashCommand.AddOption(iterationsOption);
            hashCommand.AddOption(bytesOption);

            hashCommand.Handler = CommandHandler.Create<string, string?, SaltFormat, int, int, int>((input, salt, saltFormat, saltLength, iterations, bytes) => { 
                
                byte[] saltBytes = RandomNumberGenerator.GetBytes(saltLength);
                bool randomSalt = string.IsNullOrEmpty(salt);

                if(!randomSalt)
                {
                    switch(saltFormat)
                    {
                        case SaltFormat.text:
                            saltBytes = Encoding.UTF8.GetBytes(salt!);
                            break;
                        case SaltFormat.hex:
                            try
                            {
                                saltBytes = Convert.FromHexString(salt!);
                            }
                            catch (FormatException)
                            { 
                                randomSalt = true;
                                Console.ForegroundColor = ConsoleColor.Yellow;
                                Console.WriteLine();
                                Console.WriteLine("ALERTA: Formato de sal no es correcto. Utilizando bytes aleatorios en vez de valor proporcionado...");
                                Console.ResetColor();
                            }
                            break;
                        case SaltFormat.base64:
                            try
                            {
                                saltBytes = Convert.FromBase64String(salt!);
                            }
                            catch (FormatException)
                            { 
                                randomSalt = true;
                                Console.ForegroundColor = ConsoleColor.Yellow;
                                Console.WriteLine();
                                Console.WriteLine("ALERTA: Formato de sal no es correcto. Utilizando bytes aleatorios en vez de valor proporcionado...");
                                Console.ResetColor();
                            }
                            break;
                    }
                }

                Rfc2898DeriveBytes hash = new (input, 
                                            saltBytes, 
                                            iterations, 
                                            HashAlgorithmName.SHA512);

                Console.WriteLine();
                Console.WriteLine("Información Criptográfica");
                Console.WriteLine("=========================");
                Console.WriteLine("Función Criptográfica: PBKDF2");
                Console.WriteLine("Función Hashing: SHA512");
                Console.WriteLine($"Iteraciones: {iterations}");
                Console.WriteLine($"Sal: {(randomSalt ? "[Bytes Aleatorios Autogenerados]" : salt)}");

                Console.WriteLine();
                Console.WriteLine("Hash");
                Console.WriteLine("=========================");
                Console.WriteLine($"Hex: {Convert.ToHexString(hash.GetBytes(bytes))}");
                Console.WriteLine($"Base64: {Convert.ToBase64String(hash.GetBytes(bytes))}");
                Console.WriteLine($"Tamaño: {bytes} Bytes");
                Console.WriteLine();
                Console.WriteLine("Sal");
                Console.WriteLine("=========================");
                Console.WriteLine($"Hex: {Convert.ToHexString(saltBytes)}");
                Console.WriteLine($"Base64: {Convert.ToBase64String(saltBytes)}");
                Console.WriteLine($"Tamaño: {saltBytes.Length} Bytes");   
            });

            return hashCommand;
        }
    }
}
