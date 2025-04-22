class ConsoleHelper {

  private lineWidth: number = 80;

  generateLine(startChar: string, fillChar: string, endChar: string): string {
    let line = startChar;
    while (line.length < this.lineWidth - 1) {
      line += fillChar;
    }
    line += endChar;
    return line;
  }

  centerContent(content: string, width: number): string {
    if (content.length > width) {
      content = content.substring(0, width);
    }
    const padding = Math.max(0, Math.floor((width - content.length) / 2));
    return ' '.repeat(padding) + content + ' '.repeat(width - content.length - padding);
  }

  beginBox(content: string): void {
    const titleWidth = this.lineWidth - 4;
    const centeredTitle = this.centerContent(content, titleWidth);
    console.info(this.generateLine('╔', '═', '╗'));
    console.info(`║ ${centeredTitle} ║`);
    console.info(this.generateLine('╠', '═', '╣'));
  }

  endBox(content: string): void {
    const contentLine = `║ ${content.padEnd(this.lineWidth - 3)}║`;
    console.info(contentLine);
    console.info(this.generateLine('╚', '═', '╝'));
  }

  writeBoxLine(content: string): void {
    if (content.length > this.lineWidth - 3) {
      content = content.substring(0, this.lineWidth - 3);
    }
    const contentLine = `║ ${content.padEnd(this.lineWidth - 3)}║`;
    console.info(contentLine);
  }

  writeBox(content: string): void {
    const titleWidth = this.lineWidth - 4;
    const centeredTitle = this.centerContent(content, titleWidth);
    console.info(this.generateLine('╔', '═', '╗'));
    console.info(`║ ${centeredTitle} ║`);
    console.info(this.generateLine('╚', '═', '╝'));
    this.newLine();
  }

  newLine(): void {
    console.info('');
  }
}

export default new ConsoleHelper();