let attributes = {};

function loadJSON(fileName) {
    return fetch(fileName).then(response => response.json());
}

Promise.all([
    loadJSON('X1.json'),
    loadJSON('X2.json'),
    loadJSON('X3.json'),
    loadJSON('X4.json'),
    loadJSON('X5.json'),
    loadJSON('X6.json'),
    loadJSON('X7.json'),
    loadJSON('habitatSpesifik.json'),
    loadJSON('ukuran.json'),
    loadJSON('kecepatan.json'),
    loadJSON('jenisMahluk.json'),
    loadJSON('fiturTambahan.json'),
    loadJSON('caraMakan.json'),
    loadJSON('adaptasi.json'),
    loadJSON('masaHidup.json'),
    loadJSON('keturunan.json'),
    loadJSON('polaMakan.json'),
    loadJSON('fiturSpesial.json'),
    loadJSON('polaInteraksi.json')
]).then(results => {
    attributes = {
        X1: results[0],
        X2: results[1],
        X3: results[2],
        X4: results[3],
        X5: results[4],
        X6: results[5],
        X7: results[6],
        habitatSpesifik: results[7],
        ukuran: results[8],
        kecepatan: results[9],
        jenisMahluk: results[10],
        fiturTambahan: results[11],
        caraMakan: results[12],
        adaptasi: results[13],
        masaHidup: results[14],
        keturunan: results[15],
        polaMakan: results[16],
        fiturSpesial: results[17],
        polaInteraksi: results[18],
    };
});

function buatNama() {
    return (
        attributes.X6[Math.floor(Math.random() * attributes.X6.length)] +
        attributes.X1[Math.floor(Math.random() * attributes.X1.length)] +
        attributes.X2[Math.floor(Math.random() * attributes.X2.length)] +
        attributes.X3[Math.floor(Math.random() * attributes.X3.length)] +
        attributes.X4[Math.floor(Math.random() * attributes.X4.length)] +
        attributes.X5[Math.floor(Math.random() * attributes.X5.length)] +
        attributes.X7[Math.floor(Math.random() * attributes.X7.length)]
    );
}

function generateMonster() {
    document.getElementById('monsterInfo').innerText = "Loading...";
    document.getElementById('loadingBarContainer').style.display = "block";
    document.getElementById('loadingBar').style.width = "0%"; 
    document.getElementById('monsterImage').src = "loading.gif";
    document.getElementById('monsterImage').style.display = "block";

    setTimeout(() => {
        const monster = {
            nama: buatNama(),
            habitat: attributes.habitatSpesifik[Math.floor(Math.random() * attributes.habitatSpesifik.length)],
            ukuran: attributes.ukuran[Math.floor(Math.random() * attributes.ukuran.length)],
            kecepatan: attributes.kecepatan[Math.floor(Math.random() * attributes.kecepatan.length)],
            kekuatan: Math.floor(Math.random() * 101),
            dayaTahan: Math.floor(Math.random() * 101),
            jenis: attributes.jenisMahluk[Math.floor(Math.random() * attributes.jenisMahluk.length)],
            fitur: attributes.fiturTambahan[Math.floor(Math.random() * attributes.fiturTambahan.length)],
            caraMakan: attributes.caraMakan[Math.floor(Math.random() * attributes.caraMakan.length)],
            adaptasi: attributes.adaptasi[Math.floor(Math.random() * attributes.adaptasi.length)],
            masaHidup: attributes.masaHidup[Math.floor(Math.random() * attributes.masaHidup.length)],
            keturunan: attributes.keturunan[Math.floor(Math.random() * attributes.keturunan.length)],
            polaMakan: attributes.polaMakan[Math.floor(Math.random() * attributes.polaMakan.length)],
            fiturSpesial: attributes.fiturSpesial[Math.floor(Math.random() * attributes.fiturSpesial.length)],
            polaInteraksi: attributes.polaInteraksi[Math.floor(Math.random() * attributes.polaInteraksi.length)],
        };

        document.getElementById('loadingBarContainer').style.display = "none";
        document.getElementById('monsterInfo').innerText = 
            `Name: ${monster.nama}\n` +
            `Habitat: ${monster.habitat}\n` +
            `Size: ${monster.ukuran}\n` +
            `Speed: ${monster.kecepatan}\n` +
            `Strength: ${monster.kekuatan}\n` +
            `Durability: ${monster.dayaTahan}\n` +
            `Type: ${monster.jenis}\n` +
            `Feature: ${monster.fitur}\n` +
            `Feeding Habit: ${monster.caraMakan}\n` +
            `Adapt: ${monster.adaptasi}\n` +
            `Life Span: ${monster.masaHidup}\n` +
            `Reproductive: ${monster.keturunan}\n` +
            `Dietary Habit: ${monster.polaMakan}\n` +
            `Special Features: ${monster.fiturSpesial}\n` +
            `Interaction Patterns: ${monster.polaInteraksi}`;

        generateMonsterImage(monster);
    }, 2000); 
}

function copyToClipboard() {
    const infoText = document.getElementById('monsterInfo').innerText;
    navigator.clipboard.writeText(infoText).then(() => {
        alert("Info monster telah disalin ke clipboard!");
    }).catch(err => {
        console.error('Error copying text: ', err);
    });
}