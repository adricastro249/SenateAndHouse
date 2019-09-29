var data = ""
if (document.getElementById("senate-data")) {
    var data = 'https://api.propublica.org/congress/v1/113/senate/members.json'
} else {
    var data = "https://api.propublica.org/congress/v1/113/house/members.json"
};

var miembros = [];
var DiezPorCiento = Math.round(miembros.length * 0.1);



var pepito = new Vue({
    el: "#app",
    data: {
        "data": data,
        "members": [],
        "miembrosOrdenados": [],
        "democrats": [],
        "independents": [],
        "republicans": [],
        "numberDemocrats": 0,
        "numberRepublicans": 0,
        "numberIndependents": 0,
        "total": 0,
        "democratsAverageVotesWithParty": 0,
        "republicansAverageVotesWithParty": 0,
        "independentsAverageVotesWithParty": 0,
        "totalAverage": 0,
        "DiezPorCiento": 0,
        "leastEngaged": [],
        "mostEngaged": [],
        "leastLoyal": [],
        "mostLoyal": [],
        "listaFiltrada": [],
        "cargando": true,
        "show": false,

    },

    methods: {
        extraerData: function () {
            fetch(data, {
                // method: 'GET',//
                headers: {
                    'X-API-Key': 'ssN6u4OBmmR8KEPUACkeQdxyZrzfCv21hDlGtAQ4'
                }
            }).then(function (resultado) {
                return resultado.json()
            }).then(function (datos) {
                pepito.members = datos.results[0].members;
                miembros = datos.results[0].members;
                pepito.DiezPorCiento = Math.trunc(miembros.length * 0.1);

                pepito.democrats = miembros.filter(elemento => elemento.party == "D");
                pepito.republicans = miembros.filter(elemento => elemento.party == "R");
                pepito.independents = miembros.filter(elemento => elemento.party == "I");
                pepito.numberDemocrats = pepito.democrats.length;
                pepito.numberRepublicans = pepito.republicans.length;
                pepito.numberIndependents = pepito.independents.length;
                pepito.total = miembros.length;

                pepito.democratsAverageVotesWithParty = pepito.democrats.reduce((contador, elemento) => elemento.votes_with_party_pct + contador, 0);
                pepito.republicansAverageVotesWithParty = pepito.republicans.reduce((contador, elemento) => elemento.votes_with_party_pct + contador, 0);
                pepito.independentsAverageVotesWithParty = pepito.independents.reduce((contador, elemento) => elemento.votes_with_party_pct + contador, 0);

                pepito.totalAverage = (miembros.reduce((contador, elemento) => elemento.votes_with_party_pct + contador, 0)).toFixed(2);

                pepito.democratsAverageVotesWithParty = (pepito.democratsAverageVotesWithParty / pepito.democrats.length).toFixed(2);
                pepito.republicansAverageVotesWithParty = (pepito.republicansAverageVotesWithParty / pepito.republicans.length).toFixed(2);
                pepito.independentsAverageVotesWithParty = (pepito.independentsAverageVotesWithParty / pepito.independents.length).toFixed(2);
                pepito.totalAverage = (pepito.totalAverage / miembros.length).toFixed(2);

                pepito.leastEngaged = pepito.mayorAsistencia(pepito.ordenAttendance());
                pepito.mostEngaged = pepito.menorAsistencia(pepito.ordenAttendance());
                pepito.mostLoyal = pepito.mayorLealtad(pepito.ordenLoyal());
                pepito.leastLoyal = pepito.menorLealtad(pepito.ordenLoyal());

                setTimeout(() => {
                    pepito.cargando = false;
                    pepito.show = true;
                }, 450)

            })
                .catch(function () {
                    console.log("error")
                })
        },

        /*/
        ------------------------------------------------------------------------------------------
        fitro para la tablas DATA
        ------------------------------------------------------------------------------------------
        /*/

        filtro: function () {
            let chequeados = document.querySelectorAll("input[name=partido]:checked");
            let selected = document.querySelector("select[name=selectState]").value;

            chequeados = Array.from(chequeados);

            chequeados = chequeados.map(function (input) {
                return input.value
            });

            if (selected !== 'All') {
                pepito.listaFiltrada = (miembros).filter(member => chequeados.includes(member.party) && member.state === selected);
                pepito.members = pepito.listaFiltrada;
            } else {
                pepito.listaFiltrada = (miembros).filter(member => chequeados.includes(member.party));
                pepito.members = pepito.listaFiltrada;
            }
        },

        /*/
        ------------------------------------------------------------------------------------------
        PARA ORDENAR LOS MIEMBOS DE ASISTENCIA
        ------------------------------------------------------------------------------------------
        /*/
        //ordenar array de menor a mayor Asistencia
        ordenAttendance: function () {
            var miembrosAttendance = miembros.sort(function (a, b) {
                if (a.missed_votes_pct > b.missed_votes_pct) {
                    return 1;
                }
                if (a.missed_votes_pct < b.missed_votes_pc) {
                    return -1;
                }
                return 0;
            });
            return miembrosAttendance;
        },

        menorAsistencia: function (array) {
            var menor = [];
            for (var i = 0; i < pepito.DiezPorCiento; i++) {
                menor.push(array[i]);
            }
            while (menor[menor.length - 1].missed_votes_pct === array[i].missed_votes_pct) {
                menor.push(array[i]);
                i++
            }
            return menor;
        },

        mayorAsistencia: function (array) {
            var mayor = [];
            for (var i = array.length - 1; i >= array.length - pepito.DiezPorCiento; i--) {
                mayor.push(array[i]);
            }
            while (mayor[mayor.length - 1].missed_votes_pct === array[i].missed_votes_pct) {
                mayor.push(array[i]);
                i++
            }
            return mayor;
        },
        /*/
        ------------------------------------------------------------------------------------------
        PARA ORDENAR LOS MIEMBROS DE LEALTAD
        ------------------------------------------------------------------------------------------
        /*/

        //ordenar array de menor a mayor Asistencia
        ordenLoyal: function () {
            var miembrosLoyal = miembros.sort(function (a, b) {
                if (a.votes_with_party_pct > b.votes_with_party_pct) {
                    return 1;
                }
                if (a.votes_with_party_pct < b.votes_with_party_pct) {
                    return -1;
                }
                return 0;
            });
            return miembrosLoyal
        },

        mayorLealtad: function (array) {
            var mayor = [];
            for (var i = array.length - 1; i >= array.length - pepito.DiezPorCiento; i--) {
                mayor.push(array[i]);
            }
            while (mayor[mayor.length - 1].votes_with_party_pct === array[i].votes_with_party_pct) {
                mayor.push(array[i]);
                i++
            }
            return mayor;
        },

        menorLealtad: function (array) {
            var menor = [];

            for (var i = 0; i < pepito.DiezPorCiento; i++) {
                menor.push(array[i]);
            }

            while (menor[menor.length - 1].votes_with_party_pct === array[i].votes_with_party_pct) {
                menor.push(array[i]);
                i++
            }
            return menor;
        },

    } //termina el método
}); //termia e vue
pepito.extraerData();
//pepito.probando();