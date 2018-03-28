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
router.get('/totp-input', function(req,res){
  const userId = jwt.verify(req.cookies['usercookie'].token, process.env.TOKEN_KEY)

})
