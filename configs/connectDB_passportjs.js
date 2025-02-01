// import connection from './connectDB.js';

export default async function checkingUser(profileUser) {
    var userID = await connection.execute('SELECT * FROM information_of_users WHERE userID = ?', [profileUser.id]);
    if (userID[0][0]) {
        return;
    } else {
        // If user never loggin to page then provide a access token and refresh token for user 
        await connection.execute('INSERT INTO information_of_users(userID, username, email) VALUES (?,?,?) ', [profileUser.id, profileUser.name, profileUser.email]);
        return;
    }

}

