import { rebrickKey } from "./key.js";

// Constantly needed elements.
const details = document.querySelector("#details");
const search = document.querySelector("#lego-search");

// Return value from API when no set found for ID.
const notFound = "Not found.";

// Maps to prevent excessive API calls.
// Since these will only exist through a single session, we don't need to check for API updates
// after initial caching.
const idMap = new Map();

// Most recently accessed data.
let recentJson = null;
// Prime map with default set, 8014.
const defaultSet = 8014;
fetchSet(8014);

/**
 * Handle a search attempt.
 * 
 * Steps:
 * 1. Listen for someone searching by name
 * 2. When they search by name, get how many entries are in the agify API
 * 3. Parse this entry count into a reasonable Lego ID
 * 4. Try to get the Rebrickable API to give a Lego set.
 * 5. If they give one, slap it on the screen with details.
 * 6. If the ID was invalid, put up the default set (2009 Clone Trooper Battlepack)
 * 7. Cache data to reduce future API calls.
 * 
 * @param {*} ev Search click event.
 */
search.onsubmit = (ev) => {
    ev.preventDefault();

    const name_code = hash_code(new FormData(ev.target).get("query"))
    fetchSet(name_code)
    .then((json) => {
        recentJson = json; // Using a global variable for RecentJson for event listeners.

        // Clear out previous images.
        while (details.firstChild) {
            details.removeChild(details.firstChild);
        }

        // Prepare attributes that will be needed in all cases.
        const header = document.createElement('h2');
        const button = document.createElement('button');

        // Tailwind classes for color
        header.setAttribute('class', 'my-5 text-gray-700');
        button.setAttribute('class', 'mb-5 text-red-500 font-bold')

        // Need to place button and caption in div so that it's horizontal on desktop
        // and vertical on mobile.
        button.setAttribute("id", "details-button");

        button.innerText = "Show Details";
        button.addEventListener("click", () => {
            toggleButton();
        });

        details.appendChild(header);
        details.appendChild(button);
            
        // if json not found, go for all defaults.
        if (recentJson.detail === notFound) {
            recentJson = idMap.get(defaultSet);
            header.textContent = "You don't have a unique set. Here's the 2009 Clone Trooper Battlepack!";
        } else {
            header.textContent = `Your set is: ${recentJson.name}`;
        }
    });
}

/**
 * Hash a string (i.e. a name) to get a lego set.
 * Credit: stackoverflow.com/questions/194846/is-there-hash-code-function-accepting-any-object-type
 * @param string String to hash
 * @returns hash result
 */
function hash_code(string) {
    // Don't want to have caps sensitivity!
    string = string.toLowerCase();
    let hash = 0;
    for (let c of string) {
        const code = c.charCodeAt(0);
        hash = ((hash<<5)-hash)+code;
        hash = hash & hash;
    }
    return hash;
}

/**
 * Gets the image for the lego set associated with this id.
 * 
 * @param {int} id id for this lego set
 * @return the set associated with this id.
 */
async function fetchSet(id) {
    // There are no lego sets with a number beyond the 10000 range.
    id = id % 100000;

    // prime our data structure with the first lookup
    if (!idMap.has(id)) {
        const json = await queryAPI(id);
        idMap.set(id, json);
    }

    // Key problem with getting a set: sparse number ranges.
    // Keep trying until we find a set, or there's no chance left!
    // Reducing in increments of 10 to avoid overwhelming the API
    const divisor = 10;
    let new_id = id;
    while (idMap.get(id).detail === notFound && new_id > 1) {
        new_id = Math.round(new_id / divisor);
        const json = await queryAPI(new_id);
        idMap.set(id, json);
    }

    return idMap.get(id);
}

/**
 * Query the API for a given id.
 * New data will be contained in IdMap
 *
 * @param id ID to query
 * @returns result of API query
 */
async function queryAPI(id) {
    return fetch(`https://rebrickable.com/api/v3/lego/sets/${id}-1/?key=${rebrickKey}`)
        .then((resp) => {
            return resp.json();
        });
}

// ***** DETAILS BUTTON HANDLERS ***** //

/**
 * Toggle the button:
 * -- Show details if it's off.
 * -- Hide details if it's on.
 */
function toggleButton() {
    const button = document.querySelector("#details-button");

    // Check if button is pressed.
    if (button.innerText === "Show Details") {
        button.innerText = "Hide Details";
        placeDetails();
    } else {
        button.innerText = "Show Details";
        hideDetails();
    }
}

/**
 * Place details for the most recently accessed set down.
 */
function placeDetails() {
    const list = document.createElement("ul");
    const name = document.createElement("li");
    const num = document.createElement("li");
    const year = document.createElement("li");
    const pieces = document.createElement("li");
    const image = document.createElement("img");

    list.appendChild(name);
    list.appendChild(num);
    list.appendChild(year);
    list.appendChild(pieces);
    list.appendChild(image);

    // Slight indentation for list
    list.setAttribute('class', 'ml-2');

    image.setAttribute("src", recentJson.set_img_url);
    // Give some whitespace below image.
    image.setAttribute('class', 'mb-10');

    name.innerText = `Set Name: ${recentJson.name}`;
    num.innerText = `Set Num: ${recentJson.set_num}`;
    year.innerText = `Year Released: ${recentJson.year}`;
    pieces.innerText = `Pieces: ${recentJson.num_parts}`;
    
    details.appendChild(list);
}

/**
 * "Hide" details by removing all children of details, except the button.
 */
function hideDetails() {
    const details = document.querySelector("#details");

    while (details.lastChild != null && details.lastChild.nodeName !== "BUTTON") {
        details.removeChild(details.lastChild);
    }
}
