async function fetchData() {
    return
        fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error: " + response.status);
            }
            return response.json();
        });
}
