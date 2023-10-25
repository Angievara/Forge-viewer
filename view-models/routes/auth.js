const express = require('express');
const { getPublicToken,  getUserProfile, getInternalToken } = require('../services/aps');

let router = express.Router();

router.get('/api/auth/token', async function (req, res, next) {
    try {
        res.json(await getPublicToken());
    } catch (err) {
        next(err);
    }
});

// router.get('/api/auth/Internaltoken', async function (req, res, next) {
//     try {
//         res.json(await getInternalToken());
//     } catch (err) {
//         next(err);
//     }
// });


module.exports = router;