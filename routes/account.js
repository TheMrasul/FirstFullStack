const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwt');
const bcrypt = require('bcryptjs');
const Post = require('../models/Post');

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ',)[1];
        const decodedToken = jwt.verify(token, jwtSecret.jwtSecret)
        const userId = decodedToken.id;
        const user = await User.findById(userId);
        if(!user){
            throw new Error();
        }
    
        req.user = user;
        next()
    } catch (error) {
        res.status(401).json({ massage: 'Недопустимый токен аунтификации' });
        console.log(error);
    }
}

router.post('/reg', async (req, res) => {
    try {
        const {name, email, login, password} = req.body;
    
        const isEmail = await User.findOne({email});
        const isLogin = await User.findOne({login});

        if(isEmail){
            res.json({ massage: 'Такой email уже существует' });
            console.log('Введите другой адрес электронной почты');
        }
        if(isLogin){
            res.json({ massage: 'Такой логин уже существует' });
            console.log('Введите другой логин, этот уже занят');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            login
        });
    
        await newUser.save()
        console.log(`Пользователь ${newUser} сохранен`);
    } catch (error) {
        console.log(error)
    }

});

router.post('/auth', async (req, res) => {
    try {
        const {email, login, password} = req.body;

        const isEmail = await User.findOne({email})
        const isLogin = await User.findOne({login})

        if(!isEmail){
            res.json({ massage: 'Данный email не существует' })
            console.log(`Данный email ${email} не существует`);
            return
        }
        if(!isLogin){
            res.json({ massage: 'Данный логин не существует' })
            console.log(`Данный email ${login} не существует`);
            return
        }

        const isMatch = await bcrypt.compare(password, isEmail.password)

        if(!isMatch) {
            return res.status(401).json({ massage: 'Не правильно введёный пороль' })
        }

        const payload = { id: isEmail.id };
        const token = jwt.sign(payload, jwtSecret.jwtSecret, {expiresIn: '24h'});

        res.json({ token })
        } catch (error) {
            res.status(500).json({ massage: 'Произошла ошибка на стороне сервера' })
            console.log(error);
    }    
});

router.post('/post', async (req, res) => {
    try {
        const { user, content, photoUrl } = req.body;

        const newPost = new Post({
            user,
            content,
            photoUrl,
        });

        const post = await newPost.save();
        res.status(201).json(post)
        console.log(`Добавлен новый пост ${newPost}`);
    } catch (error) {
        console.log(error);
    }
});

router.post('/post/:postId/like', async (req, res) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({ massage: 'Пост не найден' });
        }

        post.likeCount += 1;

        await post.save();

        res.status(200).json({ likeCount: post.likeCount });

    } catch (error) {
        console.log(error)
    }
})

router.get('/user', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ',)[1];

        const decodedToken = jwt.verify(token, jwtSecret.jwtSecret);

        const userId = decodedToken.id;

        const user = await User.findById(userId);

        res.json({ name: user.name, email: user.email, login: user.login})
    } catch (error) {
        console.log(error);
    }
})
router.get('/post', async(req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts)
    } catch (error) {
        console.log(error)
    }
})
router.get('/post/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        res.json(post);
    } catch (error) {
        console.log(error);
    }
})
router.get('/myProfile', async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ',)[1];
        const decodedToken = jwt.verify(token, jwtSecret.jwtSecret)
        const userId = decodedToken.id;
        const user = await User.findById(userId);

        let userProfile;

        const post = await Post.find({user: user.login});

        userProfile = {user, post};

        res.json(userProfile);
    } catch (error) {
        console.log(error);
    }
})


module.exports = router;