// import connection from '../configs/connectDB.js';

//API là một tập các quy tắc và cơ chế mà theo đó, một ứng dụng hay một thành phần sẽ tương tác với một ứng dụng hay thành phần khác.
// REST (REpresentational State Transfer) là một dạng chuyển đổi cấu trúc dữ liệu, một kiểu kiến trúc để viết API. Nó sử dụng phương thức HTTP đơn giản để tạo cho giao tiếp giữa các máy.
// RESTful API là một tiêu chuẩn dùng trong việc thiết kế các API cho các ứng dụng web để quản lý các resource
// Chức năng quan trọng nhất của REST là quy định cách sử dụng các HTTP method (như GET, POST, PUT, DELETE…) và cách định dạng các URL cho ứng dụng web để quản các resource.

export let getAPIusers = async (req, res) => {
    const [rows, fields] = await connection.execute('SELECT * FROM `mydata01`'); // [rows,fields] is destruturing in javascript
    return res.status(200).json({
        messsage: 'OK',
        data: rows
    })
}

export let createUser = async (req, res) => {
    let newInf = req.body;
    if (!newInf.firstname || !newInf.lastname || !newInf.email || !newInf.password) {
        return res.status(200).json({
            message: 'Missing params'
        })
    }
    await connection.execute('INSERT INTO mydata01(firstname,lastname,email,password) VALUES (?,?,?,?)', [newInf.firstname, newInf.lastname, newInf.email, newInf.password]);
    return res.status(200).json({
        message: 'OK'
    })
}

export let updateUser = async (req, res) => {
    let infUser = req.body;
    if (!infUser.firstname || !infUser.lastname || !infUser.email || !infUser.password || !No) {
        return res.status(200).json({
            message: 'Missing params'
        })
    }
    await connection.execute('UPDATE mydata01 SET firstname = ? , lastname = ? , email = ? , password = ? ', [infUser.firstname, infUser.lastname, infUser.email, infUser.password]);
    return res.status(200).json({
        message: 'OK'
    })
}

export let deleteUser = async (req, res) => {
    let userNo = req.params.No;
    await connection.execute('DELETE FROM mydata01 WHERE `No` = ?', [userNo]);
    return res.status(200).json({
        message: 'OK'
    })
}
