document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('light-theme');
    });
    
    // Load data from Google Sheets
    loadSheetData();
});

async function loadSheetData() {
    try {
        const spreadsheetId = '1qPu8Ht3rHZmZ7Vr0ajiPqZhhm21cCwkvAB9wuPOqiEY';
        
        // Try the CSV export method first
        const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch CSV data');
        }
        
        const csvData = await response.text();
        processCSVData(csvData);
    } catch (error) {
        console.error('Error loading data:', error);
        showError();
        
        // Try alternative method if CSV fails
        try {
            await tryAlternativeMethod();
        } catch (altError) {
            console.error('Alternative method also failed:', altError);
            showError();
        }
    }
}

async function tryAlternativeMethod() {
    const spreadsheetId = '1qPu8Ht3rHZmZ7Vr0ajiPqZhhm21cCwkvAB9wuPOqiEY';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
    
    // Create a script element for JSONP approach
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonpCallback_' + Date.now();
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.head.removeChild(script);
            processGVizData(data);
            resolve();
        };
        
        const script = document.createElement('script');
        script.src = `${url}&callback=${callbackName}`;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function processCSVData(csv) {
    const container = document.getElementById('content-container');
    container.innerHTML = '';
    
    const rows = csv.split('\n');
    const columnCount = rows[0].split(',').length;
    
    // Create columns
    for (let i = 0; i < columnCount; i++) {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        container.appendChild(columnDiv);
    }
    
    // Process each row
    rows.forEach(row => {
        const columns = row.split(',');
        columns.forEach((cell, index) => {
            if (index < columnCount && cell.trim()) {
                const columnDiv = container.children[index];
                columnDiv.appendChild(formatText(cell));
            }
        });
    });
}

function processGVizData(data) {
    const container = document.getElementById('content-container');
    container.innerHTML = '';
    
    const columns = data.table.cols.map(() => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        container.appendChild(columnDiv);
        return columnDiv;
    });
    
    data.table.rows.forEach(row => {
        row.c.forEach((cell, index) => {
            if (cell && cell.v !== null && index < columns.length) {
                columns[index].appendChild(formatText(cell.v));
            }
        });
    });
}

function showError() {
    document.getElementById('content-container').innerHTML = `
        <div class="error">
            <p>Failed to load data. Please ensure:</p>
            <ol>
                <li>Your Google Sheet is published (File > Share > Publish to web)</li>
                <li>You're viewing this page through a web server (not as file://)</li>
                <li>You have an active internet connection</li>
            </ol>
            <button onclick="location.reload()">Try Again</button>
        </div>
    `;
}

// Keep all your existing formatting functions exactly the same:
function formatText(text) {
    const element = document.createElement('div');
    
    if (typeof text !== 'string') text = String(text);
    
    // Handle H1 tags [text]
    text = text.replace(/\[(.*?)\]/g, (match, content) => {
        return `<h1>${formatHeading(content)}</h1>`;
    });
    
    // Handle H2 tags <text>
    text = text.replace(/<(.*?)>/g, (match, content) => {
        return `<h2>${formatHeading(content)}</h2>`;
    });
    
    // Handle quotes "text"
    text = text.replace(/"(.*?)"/g, (match, content) => {
        return `<div class="quote">${applyBionicReading(content)}</div>`;
    });
    
    // Handle superscript - text
    text = text.replace(/-\s(.*?)(\s|$)/g, (match, content, space) => {
        return `<sup>${applyBionicReading(content)}</sup>${space}`;
    });
    
    // Handle YouTube links
    if (text.match(/youtube\.com|youtu\.be/)) {
        const videoId = extractYouTubeId(text);
        if (videoId) {
            const youtubeDiv = document.createElement('div');
            youtubeDiv.className = 'youtube-embed';
            youtubeDiv.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allowfullscreen>
                </iframe>
            `;
            return youtubeDiv;
        }
    }
    
    // Handle image URLs
    if (text.match(/\.(jpeg|jpg|gif|png)$/i)) {
        const img = document.createElement('img');
        img.src = text;
        img.alt = '';
        return img;
    }
    
    // Apply bionic reading to remaining text
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    
    if (paragraphs.length > 1) {
        paragraphs.forEach(p => {
            const pElement = document.createElement('p');
            pElement.innerHTML = applyBionicReading(p);
            element.appendChild(pElement);
        });
    } else {
        element.innerHTML = applyBionicReading(text);
    }
    
    return element;
}

function formatHeading(text) {
    const vowels = ['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u'];
    let formatted = '';
    
    for (let char of text) {
        if (vowels.includes(char)) {
            formatted += `<span class="vowel">${char}</span>`;
        } else if (char.match(/[a-zA-Z]/)) {
            formatted += `<span class="consonant">${char}</span>`;
        } else {
            formatted += char;
        }
    }
    
    return formatted;
}

function applyBionicReading(text) {
    if (/<[a-z][\s\S]*>/i.test(text)) return text;
    
    return text.split(' ').map(word => {
        if (word.length === 0) return '';
        
        const boldLength = Math.ceil(word.length / 3);
        const boldPart = word.substring(0, boldLength);
        const restPart = word.substring(boldLength);
        
        return `<span class="bionic-word"><span class="bionic-part">${boldPart}</span>${restPart}</span>`;
    }).join(' ');
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
