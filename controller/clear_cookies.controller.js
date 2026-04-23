const clear_cookies = (req,res) => {
    res.clearCookie('data');
    res.json({
        message: "clear cookie"
    })
}

export default clear_cookies