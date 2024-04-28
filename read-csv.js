class DayInfo {
    constructor(day, price, volume) {
        this.day = day;
        this.price = parseFloat(price) || null; // Преобразуем строку в число, если возможно
        this.volume = parseFloat(volume) || null;
    }
}

class ItemInfo {
    constructor(name) {
        this.name = name;
        this.infoArray = [];
    }

    addDayInfo(dayInfo) {
        this.infoArray.push(dayInfo);
    }
}


let globalData = [];  // Глобальная переменная для хранения данных

function readCSVFile() {
    const input = document.getElementById('fileInput');
    const file = input.files[0];
    if (!file) {
        console.log("No file selected.");
        return;
    }
    const reader = new FileReader();

    reader.onload = function(event) {
        const text = event.target.result;
        globalData = csvToObject(text);
        console.log("Data loaded successfully:", globalData);
    };

    reader.onerror = function() {
        alert('Unable to read file');
    };

    reader.readAsText(file);
}
function csvToObject(csvString) {
    console.log("csv string = ", csvString);
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');

    const items = {};  // Объект для хранения ItemInfo объектов по имени товара

    lines.slice(1).forEach(valueLine => {
        const values = parseCSVLine(valueLine);
        const date = values[headers.indexOf('Date')];  // Получаем дату из каждой строки

        headers.forEach((header, index) => {
            if (header.endsWith("_Price") || header.endsWith("_Vol")) {
                const name_parts = header.split('_');
                name_parts.pop();
                const name = name_parts.join("_");  // Извлекаем имя товара из заголовка
                const priceIndex = headers.indexOf(name + "_Price");
                const volumeIndex = headers.indexOf(name + "_Vol.");

                // Удаляем запятые и обрабатываем пустые строки
                const price = values[priceIndex] ? parseFloat(values[priceIndex].replace(/,/g, '')) : null;
                const volume = values[volumeIndex] ? parseFloat(values[volumeIndex].replace(/,/g, '')) : null;

                if (!items[name]) {
                    items[name] = new ItemInfo(name);  // Создаем новый объект ItemInfo, если не существует
                }

                const dayInfo = new DayInfo(date, price, volume);
                items[name].addDayInfo(dayInfo);
            }
        });
    });

    return Object.values(items);  // Возвращаем массив всех ItemInfo объектов
}



function parseCSVLine(text) {
    //                     "2,315.64" 
    const regex = /(?:^|,)(?:"([^"]*)"|([^,]*))/g;
    let result = [];
    let match;

    while (match = regex.exec(text)) {
        if (match[1] !== undefined) { // если значение заключено в кавычки
            result.push(match[1].replace(/,/g, ''));
        } else { 
            result.push(match[2]);
        }
    }
    return result;
}