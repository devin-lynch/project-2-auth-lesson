const express = require('express')
const router = express.Router()
const db = require('../models')

// GET /users/new -- render a form to create a new user
router.get('/new', (req, res) => {
    res.render('users/new.ejs')
})

// POST /users -- create a new user in the db
router.post('/', async (req, res) => {
    try {
        // create a new user
        const newUser = await db.user.create(req.body)
        // store that new user's id as a cookie in the browser
        // res.cookie('key', value)
        res.cookie('userId', newUser.id)
        // redirect to the homepage
        res.redirect('/users/profile')

    } catch(err) {
        console.warn(err)
        res.send(`Server Error 💀`)
    }
})

// GET /users/login -- show a login form to the user
router.get('/login', (req, res) => {
    console.log(req.query)
    res.render('users/login.ejs', {
        // if the req.query.message exists, pass it as as the message, otherwise pass in null
        // ternary operator
        // condition ? expression if truthy : expression if falsy
        message: req.query.message ? req.query.message : null
    })
        
})

// POST /users/login -- accept a payload of form data and user it to log a user in
router.post('/login', async (req, res) => {
    try {
        // look up the user in the db using the supplied email
        const user = await db.user.findOne({
            where: {
                email: req.body.email
            }
        })
        const noLoginMessage = 'Incorrect username or password'

        // if the user is not found -- send the user back to the login form
        if (!user) {
            console.log(`user not found`)
            res.redirect('/users/login?message=' + noLoginMessage)
        // if the user is found but has given wrong password -- send them back to login form
        } else if (user.password !== req.body.password) {
            console.log(`Wrong password`)
            res.redirect('/users/login?message=' + noLoginMessage)
        // if the user is found and the supplied matches what is in the db -- log them in
        } else {
            console.log('Loggin the user in!!!')
            res.cookie('userId', user.id)
            res.redirect('/users/profile')
        }
    } catch(err) {
        console.warn(err)
        res.send(`Server Error 💀`)
    }
})

// GET /users/logout -- log out a user by clearing the stored cookie
router.get('/logout', (req, res) => {
    // clear the cookie
    res.clearCookie('userId')
    // redirect to the homepage
    res.redirect('/')
})

router.get('/profile', (req, res) => {
    // if the user is not logged in -- we need to redirect to the login form
    if (!res.locals.user) {
        res.redirect('/users/login?message=You must authenticate before you are authorized to view this resource')
    // otherwise, show them their profile 
    } else {
        res.render('users/profile.ejs', {
            user: res.locals.user
        })
    }
})

module.exports = router