using System.CommandLine;
using Crypter;

RootCommand rootCommand = new();

rootCommand.AddCommand(HashCommand.CreateCommand());

rootCommand.Invoke(args);

/*rootCommand.Invoke(new string[] { "hash", "Hola", "-i", "10000" });*/