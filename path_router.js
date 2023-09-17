const express = require('express');
const multer = require('multer');
const pool = require('./db');
router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + '-' + uniqueSuffix + ".jpg")
    }
});

const upload = multer({ storage: storage });



router.get('/', async (req, res) => {
    res.redirect('/birds')
});



router.get('/birds', async (req, res) => {
    let conservation_status_data = []
    let birds = []

    /* conservation status from mysql */
    const db = pool.promise();
    const status_query = `SELECT * FROM ConservationStatus;`
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;
    } catch (err) {
        console.error("Error querying data! in status");
    }

    /* REPLACE THE .json WITH A MYSQL DATABASE */
    const bird_query = `SELECT B.*, CS.status_name, CS.status_colour, P.filename, P.photographer
                        FROM Bird B
                        LEFT JOIN ConservationStatus CS ON B.status_id = CS.status_id
                        LEFT JOIN Photos P ON B.bird_id = P.bird_id;`
    try {
        const [rows, fields] = await db.query(bird_query);
        birds = rows;
    } catch (err) {
        console.error("Error querying data! in birds");
    }

    /* bind data to the view (index.ejs) */
    res.render('index', { title: 'Birds of Aotearoa', birds: birds, status: conservation_status_data });
});



router.get('/birds/create', async (req, res) => {
    let conservation_status_data = []
    const db = pool.promise();
    const status_query = `SELECT * FROM ConservationStatus;`
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;
    } catch (err) {
        console.error("Error querying data! in create bird");
    }

    res.render('create-bird', { title: 'Create Bird', status: conservation_status_data });
});



router.get('/birds/:id', async (req, res) => {
    let bird = []
    let conservation_status_data = []
    const db = pool.promise();

    const status_query = `SELECT * FROM ConservationStatus;`
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;
    } catch (err) {
        console.error("Error querying data! in status id");
    }

    const bird_query = `SELECT B.*, CS.status_name, CS.status_colour, P.filename, P.photographer
                        FROM Bird B
                        LEFT JOIN ConservationStatus CS ON B.status_id = CS.status_id
                        LEFT JOIN Photos P ON B.bird_id = P.bird_id
                        WHERE B.bird_id = ?;`
    try {
        const [rows, fields] = await db.query(bird_query, [req.params.id]);
        bird = rows[0];
    } catch (err) {
        console.error("Error querying data! in birds id");
    }

    res.render('view-bird', { bird: bird, status: conservation_status_data });
});

router.get('/birds/:id/delete', async (req, res) => {
    const birdIdToDelete = req.params.id;
    const db = pool.promise();

    try {
        // First, delete the associated photos from the "Photos" table
        const deletePhotosQuery = `DELETE FROM Photos WHERE bird_id = ?;`;
        await db.query(deletePhotosQuery, [birdIdToDelete]);

        // Then, delete the bird from the "Bird" table
        const deleteBirdQuery = `DELETE FROM Bird WHERE bird_id = ?;`;
        await db.query(deleteBirdQuery, [birdIdToDelete]);

        // Redirect to the home page or any other appropriate page
        res.redirect('/birds');
    } catch (err) {
        console.error("Error deleting bird:", err);
    }
});

router.get('/birds/:id/update', async (req, res) => {
    let bird = []
    let conservation_status_data = []
    const db = pool.promise();

    const status_query = `SELECT * FROM ConservationStatus;`
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;
    } catch (err) {
        console.error("Error querying data! in status id");
    }

    const bird_query = `SELECT B.*, CS.status_name, CS.status_colour, P.filename, P.photographer
                        FROM Bird B
                        LEFT JOIN ConservationStatus CS ON B.status_id = CS.status_id
                        LEFT JOIN Photos P ON B.bird_id = P.bird_id
                        WHERE B.bird_id = ?;`
    try {
        const [rows, fields] = await db.query(bird_query, [req.params.id]);
        bird = rows[0];
    } catch (err) {
        console.error("Error querying data! in birds id");
    }

    res.render('update-bird', { title: "Update Bird" , bird: bird, status: conservation_status_data });
});




router.post('/birds/create', upload.single('photo_file'), async (req, res) => {
    let bird = req.body;
    let photo = req.file;
    const db = pool.promise();

    try {

    // insert bird data into bird table
    const bird_query = `INSERT INTO Bird (primary_name, english_name, scientific_name, order_name, family, length, weight, status_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`

    const length = parseFloat(bird.length);
    const weight = parseFloat(bird.weight);
    const status_id = parseInt(bird.status);

    await db.query(bird_query, [bird.primary_name, bird.english_name, bird.scientific_name, bird.order_name, bird.family, length, weight, status_id]);


    // gets the bird id of the bird that was just inserted
    const bird_id_query = `SELECT bird_id
                           FROM Bird
                           ORDER BY bird_id DESC
                           LIMIT 1;`

    const [rows, fields] = await db.query(bird_id_query);
    const bird_id = rows[0].bird_id;

    // insert photo data into photo table
    const photo_query = `INSERT INTO Photos (filename, photographer, bird_id) VALUES (?, ?, ?);`
    await db.query(photo_query, [photo.filename, bird.photograph, bird_id]);

    // redirect to the home page 
    res.redirect('/birds');

    } catch (err) {
        console.error("Error inserting data:\n", err);
    } 

});

router.post('/birds/edit', upload.single('photo_file'), async (req, res) => {
    let bird = req.body;
    let photo = req.file;
    const db = pool.promise();
    try {

        // insert bird data into bird table
        const bird_query = `UPDATE Bird 
                            SET primary_name = ?, english_name = ?, scientific_name = ?, order_name = ?, family = ?, length = ?, weight = ?, status_id = ?
                            WHERE bird_id = ?;`

        const length = parseFloat(bird.length);
        const weight = parseFloat(bird.weight);
        const status_id = parseInt(bird.status);

        await db.query(bird_query, [bird.primary_name, bird.english_name, bird.scientific_name, bird.order_name, bird.family, length, weight, status_id, bird.bird_id]);
        
        if (photo) {
            // insert photo data into photo table
            const photo_query = `UPDATE Photos
                                SET filename = ?, photographer = ?
                                WHERE bird_id = ?;`

            await db.query(photo_query, [photo.filename, bird.photograph, bird.bird_id]);
        }

        // redirect to the home page
        res.redirect('/birds');

    } catch (err) {
        console.error("Error inserting data:\n", err);
    }

});



router.get('*', (req, res) => {
    res.status(404);
    res.render('404-page', { status: [], title: '404 Page Not Found' });
});


module.exports = router;