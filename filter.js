
let arr = [
    '/soccer/sweden/division-1-sodra/atvidabergs-grebbestads-hlMNKZji/',
    '/soccer/world/club-friendly/ferreira-moreirense-jLRwitv8/',
    '/soccer/world/club-friendly/oudenaarde-royal-excel-mouscron-WrgnWfSK/',
    '/soccer/europe/euro-u19/portugal-italy-xSjgzWF8/',
    '/soccer/europe/europa-league/progres-niedercorn-gabala-vwYnhrwi/',
    '/soccer/europe/europa-league/nordsjaelland-cliftonville-hMR9piyr/',
    '/soccer/world/club-friendly/ue-olot-espanyol-CdsNm11d/',
    '/soccer/world/club-friendly/beerschot-wilrijk-kortrijk-pncjVEsR/',
    '/soccer/europe/europa-league/beitar-jerusalem-chikhura-sachkhere-WY1ldlzf/',
    '/soccer/brazil/brasileiro-u20/vasco-sport-recife-b57EKFq1/',
    '/soccer/europe/europa-league/luftetari-gjirokastra-ventspils-QDbt2J6F/',
    '/soccer/europe/europa-league/fc-copenhagen-kups-QioiG9RP/',
    '/soccer/iceland/inkasso-deildin/thor-akureyri-haukar-Y7TrGyHg/',
    '/soccer/sudan/premier-league/al-khartoum-al-ahly-merowe-p6F2UAD3/',
    '/soccer/world/one-friendly/york-leeds-lxF8zGbC/',
    '/soccer/world/club-friendly/weymouth-exeter-dQxUMnep/',
    '/soccer/world/club-friendly/leonesa-covadonga-2RqIQYkr/',
    '/soccer/world/club-friendly/leonesa-covadonga-2RqIQYkr/',
    '/soccer/world/one-friendly/leonesa-covadonga-2RqIQYkr/',
    '/soccer/world/one-friendly/leonesa-covadonga-2RqIQYkr/',
    '/soccer/world/two-friendly/leonesa-covadonga-2RqIQYkr/',
    '/soccer/world/club-friendly/leonesa-covadonga-2RqIQYkr/',
    '/soccer/europe/europa-league/maribor-partizani-4pVbktN9/'
    ];

let countries = ['sweden', 'brazil', 'sudan'];
let leagues = ['europa-league', 'one-friendly', 'two-friendly'];

let filtered = arr.filter(notInLists);


function notInLists(value) {

    let splitted = value.split('/');
    let country = splitted[2];
    let league = splitted[3];

    return ((countries.indexOf(country) < 0) && (leagues.indexOf(league) < 0));
}

console.log(countries);
console.log(leagues);
console.log(filtered);