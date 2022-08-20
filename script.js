//Parse de uma partida de Quake
//by Ilso Christ

const logTag = document.querySelector('#log-json')
const fileTag = document.querySelector('#file')

function debug(msg){
    console.log(">" + msg)
}

fileTag.onchange = function(){
    let file = this.files[0];
    
    let reader = new FileReader();

    reader.onload = function(){

        logTag.innerHTML = JSON.stringify(ParseLog(this.result), null, 4)
        
    }

    reader.readAsText(file);
    
}

function ParseLog(log)
{
    let logLines = log.split('\n');

    //parsedLog é um array de logs de partidas
    let parsedLog = []
    let currentGameIndex = 0
    let currentGame


    //forEach nao tem como dar break, uso every entao
    logLines.every( (line, index) => {

        // let contexto = line.match(/[0-9:]+\s(?<contexto>\w*):\s/).groups.contexto
        let contexto = line.match(/[a-z]+/i)
        let result

        // console.log(line)   

        //pra fazer um continue uso um return true, por ser um every
        if(!contexto) return true;
        
        //um if para cada evento, Kill, ClientUserinfoChanged e InitGame e ShutDownGame, outros eventos ignora
        //contexto é um object array, que possui tbm outras props
        switch(contexto[0]){
        case "Kill":
            //  3:41 Kill: 2 3 6: Dono da Bola killed Isgalamido by MOD_ROCKET
            //2 3 6 são os codigos dos players e o MOD
            debug("Morte")
            console.log(line)
            currentGame.status.total_kills++
            
            result = line.match(/(?<killerID>\d+)\s(?<killedID>\d+)\s\d+:\s(?<killer>[\w\s!\<\>]+)\skilled\s(?<killed>[\w\s!]+)\sby\s(?<mod>[\w]+)/).groups
            console.log(result)
            let ps = currentGame.status.players
            let killedIndex = result.killedID - 2
            let killerIndex = result.killerID - 2

            if(result.killerID == 1022)
            {
                ps[killedIndex].kills--
                return true
            }
            
            if(result.killerID == result.killedID)
            {
                console.log("suicidio")
                return true
            }
                
            
            ps[killerIndex].kills = ps[killerIndex].kills + 1
            
            break;
        case "InitGame":
            console.log("Inicio da Partida " + currentGameIndex)

            parsedLog.push({})
            currentGame = parsedLog[currentGameIndex]
            currentGame.gameID = currentGameIndex
            currentGame.status = {}
            currentGame.status.total_kills = 0
            currentGame.status.players = []

            break;

        case "ShutdownGame":
            console.log("Fim de Partida " + currentGameIndex)
            console.log("---------------------------")
            currentGameIndex++
            break;

        case "ClientUserinfoChanged":
            console.log("Definição de Nick")

            //  3:47 ClientUserinfoChanged: 5 n\Assasinu Credi\t\0\model\.....
            result = line.match(/(?<playerID>[0-9]+)\sn\\(?<playerNick>[\w\s!]+)\\t\\/).groups
            console.log(line)
            let currentPlayerIndex = result.playerID - 2
                        
            let currentPlayer
            
            //se nao existir o player, cria
            if(!currentGame.status.players[currentPlayerIndex]){
                currentGame.status.players[currentPlayerIndex] = {}
                currentPlayer = currentGame.status.players[currentPlayerIndex]
                currentPlayer.id = result.playerID
                currentPlayer.name = result.playerNick
                currentPlayer.kills = 0
                currentPlayer.old_names = []

            }

            currentPlayer = currentGame.status.players[currentPlayerIndex]

            if(currentPlayer.name != result.playerNick){
                currentPlayer.old_names.unshift(currentPlayer.name)
                currentPlayer.name = result.playerNick

            }
            
            break;

        default:
            // console.log("Irrelevante: " + contexto )

        }

        // if(index > 100) return false;
        return true
    });
    
    //no fim parsedLog tem de ser um array de JSONs

    return parsedLog;
}

/*
ref:
https://javascript.info/regexp-introduction
https://www.w3schools.com/js/default.asp
*/
