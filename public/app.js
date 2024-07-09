// Add event listener to the form to handle form submission
document.getElementById('foodForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get the values from the input fields
    const foodName = document.getElementById('foodName').value;
    const foodImage = document.getElementById('foodImage').files[0];
    const foodTimestamp = document.getElementById('foodTimestamp').value;

    // Check if the inputs are not empty
    if (!foodName || !foodImage || !foodTimestamp) {
        alert('Please enter a food name, select an image, and pick a date/time.');
        return;
    }

    // Create a FormData object to send the form data
    const formData = new FormData();
    formData.append('foodName', foodName);
    formData.append('foodImage', foodImage);
    formData.append('foodTimestamp', foodTimestamp);

    // Use the fetch API to send the form data to the server
    fetch('/api/food', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            // Trigger success animation and background change
            document.body.classList.add('success');
            setTimeout(() => {
                document.body.classList.remove('success');
            }, 1000); // Remove class after animation duration

            // Clear the input fields
            document.getElementById('foodName').value = '';
            document.getElementById('foodImage').value = '';
            document.getElementById('foodTimestamp').value = '';

            // Reload the list of food entries
            loadFoodEntries();
        } else {
            // Trigger failure animation and background change
            document.body.classList.add('failure');
            setTimeout(() => {
                document.body.classList.remove('failure');
            }, 1000); // Remove class after animation duration

            throw new Error('Failed to add food.'); // Throw an error for non-200 status codes
        }
    })
    .catch(error => {
        console.error('Error adding food:', error);
        alert('Failed to add food.');
    });
});

// Function to load food entries from the server and display them
function loadFoodEntries() {
    fetch('/api/food')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch food entries.'); // Throw an error for non-200 status codes
        }
        return response.json();
    })
    .then(foodEntries => {
        const foodList = document.getElementById('foodList');
        foodList.innerHTML = '';

        foodEntries.forEach(entry => {
            const foodDiv = document.createElement('div');
            foodDiv.className = 'food-entry';

            const foodName = document.createElement('h3');
            foodName.textContent = entry.name;

            const foodImage = document.createElement('img');
            foodImage.src = entry.image;
            foodImage.alt = entry.name;

            const foodTimestamp = document.createElement('p');
            foodTimestamp.textContent = new Date(entry.timestamp).toLocaleString();

            foodDiv.appendChild(foodName);
            foodDiv.appendChild(foodImage);
            foodDiv.appendChild(foodTimestamp);
            foodList.appendChild(foodDiv);
        });
    })
    .catch(error => {
        console.error('Error loading food entries:', error);
        alert('Failed to load food entries.');
    });
}

// Initial load of food entries
loadFoodEntries();
