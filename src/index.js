import express from "express";
import handelbars from "express-handlebars";
import { __dirname } from "./utils.js";
import csv from 'csv-parser';
import fs from 'fs';

const app = express();

const DATA = [];

const csvFilePath = `${__dirname}/public/files/usuarios.csv`;

app.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 3000");
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + "/public"))

app.set('views', __dirname + '/views')
app.set('view engine', '.hbs')
app.engine(".hbs", handelbars.engine({
    extname: '.hbs',
}))

app.get('/', (req, res) => {
    res.render('index')
})



const verificarExistencia = async (dni) => {
    return new Promise((resolve, reject) => {
        let existe = false;
        fs.createReadStream(csvFilePath)
            .pipe(csv({ separator: ';' }))
            .on('data', (row) => {
                if (row.dni === dni.toString()) {
                    existe = true;
                }
            })
            .on('end', () => {
                resolve(existe);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

const agregarUsuario = (datos) => {
    const apellidoUpperCase = datos.apellido.trim().toUpperCase();
    const entrada = `${datos.dni};${apellidoUpperCase}\n`;
    verificarExistencia(datos.dni, (existe) => {
        if (existe) {
            console.log("1");
            console.error('Error: El usuario ya existe');
        } else {
            console.log("2");
            try {
                fs.appendFileSync(csvFilePath, entrada);
                console.log('El archivo ha sido actualizado', datos);
            } catch (error) {
                console.log('Error al agregar entrada', error);
            }
        }
    });
};

const manejoSolicitud = async (datos) => {
    try {
        const existe = await verificarExistencia(datos.dni);
        if (existe) {
            console.error('Error: El usuario ya existe');
        } else {
            const apellidoUpperCase = datos.apellido.trim().toUpperCase();
            const entrada = `${datos.dni};${apellidoUpperCase}\n`;
            fs.appendFileSync(csvFilePath, entrada);
            console.log('El archivo ha sido actualizado', datos);
        }
    } catch (error) {
        console.error('Error al verificar la existencia:', error);
    }
};



app.post('/registrar', (req, res) => {
    const { apellido, dni } = req.body
     manejoSolicitud({ dni, apellido })
})



