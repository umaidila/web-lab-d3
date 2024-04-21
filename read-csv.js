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

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const text = event.target.result;
        globalData = csvToObject(text);  // Update the global data object with processed data
    };

    reader.onerror = function() {
        alert('Unable to read file');
    };

    reader.readAsText(file);
}

function csvToObject(csvString) {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');

    const items = {};  // Объект для хранения ItemInfo объектов по имени товара

    lines.slice(1).forEach(line => {
        const values = line.split(',');
        const date = values[headers.indexOf('Date')];  // Получаем дату из каждой строки

        headers.forEach((header, index) => {
            if (header.endsWith("_Price")) {
                const name = header.split('_')[0];  // Извлекаем имя товара из заголовка
                const price = values[index];  // Цена для данного товара
                const volumeHeader = `${name}_Vol`;  // Создаем заголовок для объема
                const volumeIndex = headers.indexOf(volumeHeader);
                const volume = values[volumeIndex];  // Объем для данного товара

                if (!items[name]) {
                    items[name] = new ItemInfo(name);  // Создаем новый объект ItemInfo, если не существует
                }

                const dayInfo = new DayInfo(date, price, volume);  // Создаем объект DayInfo
                items[name].addDayInfo(dayInfo);  // Добавляем DayInfo к соответствующему ItemInfo
            }
        });
    });

    return Object.values(items);  // Возвращаем массив всех ItemInfo объектов
}

