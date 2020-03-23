const users = [];

const addUser = ({ id, username, room }) => {
	// clean the data
	username = username.trim().toLowerCase();
	// validate the data
	if (!username || !room) {
		return {
			error: "Username and room are required!"
		};
	}
	// Check for existing user
	const existingUser = users.find(user => {
		return user.username === username && user.room === room;
	});

	// validate username
	if (existingUser) {
		return { error: "Username is in use!" };
	}
	// store the user
    const user = { id, username, room };
	users.push(user);
    console.log("users are ", users);
	return {user};
};

const removeUser = id => {
	// find the user index
	// Returns the index of the first element in the array where predicate is true, and -1 otherwise.
	const userIndex = users.findIndex(user => user.id === id);

	// remove the user
	if (userIndex !== -1) {
		// Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
		return users.splice(userIndex, 1)[0];
	}
};
// Get a specific user by the userid
const getUser = id => {
	const user = users.find(user => user.id === id);
	return user;
};

// get all users in a specifil user room
const getUsersInRoom = room => {
	room = room.trim().toLowerCase();
	return users.filter(user => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
