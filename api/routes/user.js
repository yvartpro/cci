const express = require('express')
const router = express.Router()
const db = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { authRequired, requireRole } = require('../middlewares/auth')

const User = db.User
const JWT_SECRET = process.env.JWT_SECRET

const safeAttributes = { exclude: ['passwordHash'] }

// List Users
router.get('/', authRequired, requireRole('admin', 'editor'), async (req, res) => {
    try {
        const { role, status } = req.query
        const where = {}
    
        if (role) where.role = status
        if (status) where.status = status
        const list = await User.findAll({
          where,
          attributes: { exclude: ['passwordHash'] },
          order: [['createdAt', 'DESC']],
          limit: 100
        })

        res.json(list)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Create User
router.post('/', async (req, res) => {
    try {
        const { fullName, email, password } = req.body || {}
        const exists = await User.findOne({ where: { email }})
        if (exists) return res.status(400).json({error: "Cet adresse email est deja utilise"})
        if (password.length < 6) return res.status(400).json({ error: "Le mot de passe doit avoir au moins 6 caracteres" })
        const user = await User.create({
            fullName: fullName,
            email: email,
            passwordHash: password
        })
        const userJSON = user.toJSON()
        delete userJSON.passwordHash
        delete userJSON.createdAt
        delete userJSON.updatedAt
        res.status(201).json(userJSON)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Get current user's info (me)
router.get('/me', authRequired, async (req, res) => {
  try {
    // Log the user object to check if it's being properly populated (remove in production)
    console.log('Authenticated user:', req.user);  // This should log the decoded user data

    // Find the user by their ID stored in req.user.id
    const user = await User.findByPk(req.user.id, { attributes: safeAttributes });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the user object without the sensitive fields
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});



// login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" })
  }

  const user = await User.findOne({ where: { email } })

  if (!user) {
    return res.status(404).json({ error: "Email or password is incorrect" })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)

  if (!valid) {
    return res.status(401).json({ error: "Email or password is incorrect" })
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({
    message: "Login successful",
    token,
    user: { id: user.id, fullName: user.fullName, role: user.role }
  })
})



// Get single User
router.get('/:id', authRequired, requireRole("admin"), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: safeAttributes })
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json(user)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Update User
router.patch('/:id', authRequired, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: safeAttributes })
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouve' })
        const patch = req.body || {}
        Object.keys(patch).forEach((key) => { user[key] = patch[key] })
        await user.save()
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Delete User
router.delete('/:id', authRequired, requireRole("admin"), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: safeAttributes })
        if (!user) return res.status(404).json({ error: 'User not found' })
        await user.destroy()
        res.json({ deleted: true, message: "Utilisateur supprime avec success" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})


module.exports = router
