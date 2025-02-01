// View engines allow us to render web pages using template files. These templates are filled with actual data and served to the client.
import express from "express";
import expressEjsLayouts from "express-ejs-layouts";


function configViewEngine(app) {
    app.use(express.static('./public')); // public files in public directory which people can see on client site.
    app.use("/css", express.static("./node_modules/bootstrap/dist/css"));
    app.use("/js", express.static('./node_modules/bootstrap/dist/js'));
    app.use('/client-dist', express.static('./node_modules/socket.io/client-dist'));
    
    app.set("view engine", "ejs");
    app.set("views", "./views");
}

export default configViewEngine;
