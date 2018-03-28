const passport=require('passport')
const TotpStrategy= require('passport-totp').Strategy
router.get('/totp-setup', function(req, res){

  const secret = base32.encode(crypto.randomBytes(16)).toString().replace(/=/g, '')
  const url = "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/"
              +req.user.username.toString().replace(/ /g, '') //get rid of spaces
              +"?secret="
              +secret
  res.status(200).json({
    secret : secret,
    url : url
  })
})
passport.use(new TotpStrategy( function(user, done){
  console.log("this is totp******************************")
  if(!user.key){
    return done(new Error('no key'))
  } else {
    return done(null, base32.decode(user.key), 30)
  }
})
router.get('/totp-input', function(req,res){
  const cookie = jwt.verify(req.cookies['usercookie'].token, process.env.TOKEN_KEY)
  User.findOne({_id : cookie.userId}, function(err, user){
    if(!user.key)
      user.key=cookie.key
    passport.authenticate('totp', function(err, user, info){
      if(err){
        res.status(403).json({error : err})
      } else {
      user.save(function(err){
        if(err)
          console.log('problem') console.log(err)
        else
          console.log('updated key successefully')
      })
      res.status(200).json({message : "authentified"})
    })
  })
})
