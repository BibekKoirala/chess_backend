const express = require('express');
const UserSettingModel = require('../../Models/UserSetting.Model');

// Creating an instance of the express server
const SettingsRouter = express.Router();

SettingsRouter.get('/setting', (req, res) => {
    UserSettingModel.findOne({ user: req.userId})
    .then((result) => {
        if (result) {
            res.status(200).json({ message: 'Success.', data: result });
        }
        else {
            res.status(400).json({ message: 'Could not fetch user settings.', data: [] });
        }
    })
    .catch((err) => {
        res.status(400).json({ message: 'Could not fetch user settings.', data: [] });
    })
})

SettingsRouter.post('/setting', (req, res) => {
    const { against, format, difficulty, playas} = req.body
    if ((!against && against!=0) || (!format && format!=0) || (!difficulty && difficulty!=0) || !playas) {
        res.status(400).json({ message: 'Bad Request. Could not update record.', data: [] });
        return;
    }
    if (![0,1].includes(against)) {
        res.status(400).json({ message: 'Bad Request. Could not update record.', data: [] });
        return;
    }
    if (![0,1,2,3].includes(format)) {
        res.status(400).json({ message: 'Bad Request. Could not update record.', data: [] });
        return;
    }
    if (![0,1,2].includes(difficulty)) {
        res.status(400).json({ message: 'Bad Request. Could not update record.', data: [] });
        return;
    }
    if (!['b','w','a'].includes(playas)) {
        res.status(400).json({ message: 'Bad Request. Could not update record.', data: [] });
        return;
    }
    UserSettingModel.findOneAndUpdate({ user: req.userId}, {
        against: against,
        format: format,
        difficulty: difficulty,
        playas: playas,
    })
    .then((result) => {
        if (result) {
            res.status(200).json({ message: 'Setting updated successfully.', data: result });
        }
        else {
            res.status(400).json({ message: 'Bad Request. Could not update record.', data: [] });
        }
    })
    .catch((err) => {
        res.status(400).json({ message: 'Bad Request. Could not update record.', data: [] });
    })
})

module.exports = SettingsRouter