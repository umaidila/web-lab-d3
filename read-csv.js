class DayInfo {
    constructor(day) {
        this.day = day;
        this.prices = {};  // Словарь для хранения цен: ключ - название компании, значение - цена
    }

    addPrice(name, price) {
        this.prices[name] = price;  
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
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');

    const days = {};  // Объект для хранения массива DayInfo

    lines.slice(1).forEach(valueLine => {
        const values = parseCSVLine(valueLine);
        const date = values[headers.indexOf('Date')];  // Получаем дату из каждой строки


        if (!days[date]) {
            days[date] = new DayInfo(date);  // Создаем новый DayInfo для дня, если он еще не существует
        }

        headers.forEach((header, index) => {
            if (header.endsWith("_Price") ) {
                const name_parts = header.split('_');
                name_parts.pop();
                const name = name_parts.join("_");  // Извлекаем имя товара из заголовка
                const priceIndex = headers.indexOf(name + "_Price");

                // Удаляем запятые и обрабатываем пустые строки
                const price = values[priceIndex] ? parseFloat(values[priceIndex].replace(/,/g, '')) : null;
               
                days[date].addPrice(name, price);
            }
        });
    });

    return Object.values(days);  // Возвращаем массив всех ItemInfo объектов
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