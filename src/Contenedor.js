import fs from "fs";

export class Contenedor {
  constructor(fileName) {
    this.fileName = fileName;
    this.encoding = "utf-8";
    this.fs = fs;
  }

  async #writeToFile(textToWrite) {
    try {
      await this.fs.promises.writeFile(this.fileName, textToWrite);
    } catch (error) {
      console.error(error);
    }
  }

  async #readFile() {
    try {
      const content = await this.fs.promises.readFile(
        this.fileName,
        this.encoding
      );
      return content;
    } catch (error) {
      console.error(error);
    }
  }

  async save(element) {
    let newId = 0;
    try {
      const content = await this.#readFile();
      if (!content) {
        const contentToWrite = JSON.stringify(
          [{ id: newId, ...element }],
          null,
          2
        );
        await this.#writeToFile(contentToWrite);
        return newId;
      } else {
        const contentToArray = JSON.parse(content);
        newId = contentToArray[contentToArray.length - 1].id + 1;
        contentToArray.push({ id: newId, ...element });
        await this.#writeToFile(JSON.stringify(contentToArray, null, 2));
        return newId;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getById(id) {
    try {
      const content = await this.#readFile();

      if (!content) {
        console.log("El archivo está vacío");
        return;
      }

      const contentToArray = JSON.parse(content);
      const producto = contentToArray.find((producto) => producto.id === id);

      if (!producto) {
        console.log("Producto con id", id, "no encontrado");
        return null;
      }

      return producto;
    } catch (error) {
      console.error(error);
    }
  }

  async getAll() {
    try {
      const content = await this.#readFile();

      if (!content) {
        console.log("El archivo está vacío");
        return [];
      }

      const productos = JSON.parse(content);
      return productos;
    } catch (error) {
      console.error(error);
    }
  }

  async deleteById(id) {
    try {
      const content = await this.#readFile();

      if (!content) {
        console.log("El archivo está vacío");
        return;
      }

      const contentToArray = JSON.parse(content);
      const index = contentToArray.findIndex((p) => p.id === id);
      contentToArray.splice(index, 1);
      const newContent = JSON.stringify(contentToArray, null, 2);

      await this.#writeToFile(newContent);
    } catch (error) {
      console.error(error);
    }
  }

  async deleteAll() {
    await this.#writeToFile("");
  }
}
