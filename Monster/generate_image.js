function generateMonsterImage(monster) {
    const prompt = `Generate an image of a monster that looks like ${monster.jenis} with characteristics such as size: ${monster.ukuran}, habitat: ${monster.habitat}, features: ${monster.fitur}, feeding method: ${monster.caraMakan}, adaptations: ${monster.adaptasi}, lifespan: ${monster.masaHidup}, offspring: ${monster.keturunan}, diet: ${monster.polaMakan}, special features: ${monster.fiturSpesial}, and interaction pattern: ${monster.polaInteraksi}.`;

    fetchMonsterImage(prompt)
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);
            const monsterImage = document.getElementById('monsterImage');
            monsterImage.src = imageUrl;

            // Menambahkan tombol download
            const downloadButton = document.getElementById('downloadButton');
            downloadButton.style.display = 'block'; // Tampilkan tombol download
            downloadButton.href = imageUrl; // Set URL untuk download
           
        })
        .catch(error => {
            console.error('Error fetching the monster image:', error);
            document.getElementById('monsterImage').style.display = "none";
        });
}