// Script to preview photo in html form after user selects a photo file
document.addEventListener('DOMContentLoaded', function () {
    const photo_file = document.getElementById('photo_file');
    if (photo_file){
        photo_file.onchange = evt => {
            const [file] = photo_file.files;
            if (file) {
                document.getElementById('photo_preview').src = URL.createObjectURL(file);
                document.getElementById('photo_source').value = file.name;
            }
        }
    }
});