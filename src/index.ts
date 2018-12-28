import app from "./api/app";
const PORT = 3000;

app.listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
})