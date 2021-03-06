import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { PdfBorders, PdfTreeGridColumn, PdfTreeGridRow, PdfTreeGridCell, TemporaryDictionary } from './index';
import { PdfTreeGrid } from '../pdf-treegrid';
import { PdfHorizontalOverflowType } from '../../base/interface';
import {
    ElementLayouter, PdfLayoutResult, PdfLayoutFormat, SizeF, PdfPage, PointF, PdfGraphics,
    RectangleF, PdfLayoutParams, RowLayoutResult, PdfLayoutType, PdfLayoutBreakType
} from '@syncfusion/ej2-pdf-export';
import { PdfDocument, PdfSection, PdfStringLayoutResult, PdfStringFormat } from '@syncfusion/ej2-pdf-export';

/**
 * 
 */
export class PdfTreeGridLayouter extends ElementLayouter {
    private currentPage: PdfPage;
    private currentGraphics: PdfGraphics;
    private currentPageBounds: SizeF;
    private currentBounds: RectangleF;
    private startLocation: PointF;
    public columnRanges: number[][] = [];
    private cellStartIndex: number;
    private cellEndIndex: number;
    private repeatRowIndex: number = -1;
    private treegridHeight: number;
    constructor(baseFormat: PdfTreeGrid) {
        super(baseFormat);
        this.currentBounds = new RectangleF(0, 0, 0, 0);
    }
    public get treegrid(): PdfTreeGrid {
        return this.elements as PdfTreeGrid;
    }

    public layoutInternal(param: PdfLayoutParams): PdfLayoutResult {
        if (isNullOrUndefined(param)) {
            throw Error('Argument Null Expection');
        }
        this.currentPage = param.page;
        let format: PdfTreeGridLayoutFormat = param.format;
        if (this.currentPage !== null) {
            this.currentPageBounds = this.currentPage.getClientSize();
        }
        this.currentGraphics = this.currentPage.graphics;
        if (format !== null && format.break === PdfLayoutBreakType.FitColumnsToPage) {
            /* tslint:disable-next-line */
            this.currentBounds = new RectangleF(new PointF(param.bounds.x, param.bounds.y), new SizeF(this.treegrid.columns.width, this.currentGraphics.clientSize.height));
        } else {
            this.currentBounds = new RectangleF(new PointF(param.bounds.x, param.bounds.y), this.currentGraphics.clientSize);
        }
        if (this.treegrid.rows.count !== 0) {
            this.currentBounds.width = (param.bounds.width > 0) ? param.bounds.width :
                (this.currentBounds.width - this.treegrid.rows.getRow(0).cells.getCell(0).style.borders.left.width / 2);
        } else {
            throw Error('Please add row or header into grid');
        }
        this.startLocation = new PointF(param.bounds.x, param.bounds.y);
        if (param.bounds.height > 0) {
            this.currentBounds.height = param.bounds.height;
        }
        if (!this.treegrid.style.allowHorizontalOverflow && !this.treegrid.isFitToWidth) {
            this.treegrid.measureColumnsWidth();
            this.determineColumnDrawRanges();
        } else {
            this.treegrid.measureColumnsWidth(this.currentBounds);
            this.columnRanges.push([0, this.treegrid.columns.count - 1]);
        }
        return this.layoutOnPage(param);
    }
    /**
     * `Determines the column draw ranges`.
     * @private
     */
    private determineColumnDrawRanges(): void {
        let startColumn: number = 0;
        let endColumn: number = 0;
        let cellWidths: number = 0;
        let availableWidth: number = this.currentGraphics.clientSize.width - this.currentBounds.x;
        for (let i: number = 0; i < this.treegrid.columns.count; i++) {
            cellWidths += this.treegrid.columns.getColumn(i).width;
            if (cellWidths >= availableWidth) {
                let subWidths: number = 0;
                for (let j: number = startColumn; j <= i; j++) {
                    subWidths += this.treegrid.columns.getColumn(j).width;
                    if (subWidths > availableWidth) {
                        break;
                    }
                    endColumn = j;
                }
                this.columnRanges.push([startColumn, endColumn]);
                startColumn = endColumn + 1;
                //endColumn = startColumn;
                cellWidths = (endColumn <= i) ? this.treegrid.columns.getColumn(i).width : 0;
            }
        }
        this.columnRanges.push([startColumn, this.treegrid.columns.count - 1]);
    }

    private getFormat(format: PdfLayoutFormat): PdfTreeGridLayoutFormat {
        let f: PdfTreeGridLayoutFormat = format as PdfTreeGridLayoutFormat;
        return f;
    }

    private layoutOnPage(param: PdfLayoutParams): PdfTreeGridLayoutResult {
        let format: PdfTreeGridLayoutFormat = this.getFormat(param.format);
        let result: PdfTreeGridLayoutResult = null;
        let layoutedPages: TemporaryDictionary<PdfPage, number[]> = new TemporaryDictionary<PdfPage, number[]>();
        let startPage: PdfPage = param.page;
        for (let index: number = 0; index < this.columnRanges.length; index++) {
            let range: number[] = this.columnRanges[index];
            this.cellStartIndex = range[0];
            this.cellEndIndex = range[1];
            let rowsCount: number = this.treegrid.rows.count;
            let i: number = 0;
            let repeatRow: boolean = false;
            //Draw row by row with the specified cell range.
            for (let j: number = 0; j < rowsCount; j++) {
                let row: PdfTreeGridRow = this.treegrid.rows.getRow(j);
                i++;
                let originalHeight: number = this.currentBounds.y;
                if (this.currentPage !== null && !layoutedPages.containsKey(this.currentPage)) {
                    layoutedPages.add(this.currentPage, range);
                }
                let rowResult: RowLayoutResult = this.drawRow(row);
                //if height remains same, it is understood that row is not draw in the page.
                if (originalHeight === this.currentBounds.y) {
                    repeatRow = true;
                    this.repeatRowIndex = this.treegrid.rows.rowCollection.indexOf(row);
                } else {
                    repeatRow = false;
                    this.repeatRowIndex = -1;
                }
                while (!rowResult.isFinish && startPage !== null) {
                    if (this.treegrid.allowRowBreakAcrossPages) {
                        //If there is no space in the current page, add new page and then draw the remaining row.
                        this.currentPage = this.getNextPageFormat(format);
                        if (this.treegrid.enableHeader) {
                            this.drawHeader();
                        }
                        originalHeight = this.currentBounds.y;
                        this.checkBounds(format);
                        rowResult = this.drawRow(row);
                    } else if (!this.treegrid.allowRowBreakAcrossPages && i < length) {
                        this.currentPage = this.getNextPageFormat(format);
                        if (this.treegrid.enableHeader) {
                            this.drawHeader();
                        }
                        break;
                    } else if (i >= length) {
                        break;
                    }
                }
                if (!rowResult.isFinish && startPage !== null && format.layout !== PdfLayoutType.OnePage && repeatRow) {
                    this.startLocation.x = this.currentBounds.x;
                    this.currentPage = this.getNextPageFormat(format);
                    if (this.treegrid.enableHeader) {
                        this.drawHeader();
                    }
                    this.startLocation.y = this.currentBounds.y;
                    if (format.paginateBounds === new RectangleF(0, 0, 0, 0)) {
                        this.currentBounds.x += this.startLocation.x;
                    }
                    if (this.currentBounds.x === PdfBorders.default.left.width / 2) {
                        this.currentBounds.y += this.startLocation.x;
                    }
                    this.drawRow(row);
                    if (this.currentPage !== null && !layoutedPages.containsKey(this.currentPage)) {
                        layoutedPages.add(this.currentPage, range);
                    }
                }
            }
            if (this.columnRanges.indexOf(range) < this.columnRanges.length - 1 &&
                startPage !== null && format.layout !== PdfLayoutType.OnePage) {
                this.currentPage = this.getNextPageFormat(format);
                this.checkBounds(format);
            }
        }
        result = this.getLayoutResult();
        if (this.treegrid.style.allowHorizontalOverflow
            && this.treegrid.style.horizontalOverflowType === PdfHorizontalOverflowType.NextPage) {
            this.reArrangePages(layoutedPages);
        }
        return result;
    }

    private checkBounds(format: PdfTreeGridLayoutFormat): void {
        let location: PointF = new PointF(PdfBorders.default.right.width / 2, PdfBorders.default.top.width / 2);
        if (format.paginateBounds === new RectangleF(0, 0, 0, 0) && this.startLocation === location) {
            this.currentBounds.x += this.startLocation.x;
            this.currentBounds.y += this.startLocation.y;
        }
    }

    private drawHeader(): void {
        this.drawRow(this.treegrid.rows.getRow(0));
    }

    private reArrangePages(layoutPages: TemporaryDictionary<PdfPage, number[]>): void {
        let document: PdfDocument = this.currentPage.document;
        let pages: PdfPage[] = [];
        let keys: PdfPage[] = layoutPages.keys();
        for (let i: number = 0; i < keys.length; i++) {
            let page: PdfPage = keys[i] as PdfPage;
            page.section = null;
            pages.push(page);
            document.pages.remove(page);
        }
        for (let i: number = 0; i < layoutPages.size(); i++) {
            let count: number = (layoutPages.size() / this.columnRanges.length);
            for (let j: number = i; j < layoutPages.size(); j += count) {
                let page: PdfPage = pages[j];
                if (document.pages.indexOf(page) === -1) {
                    document.pages.add(page);
                }
            }
        }
    }

    public getNextPageFormat(format: PdfLayoutFormat): PdfPage {
        let section: PdfSection = this.currentPage.section;
        let nextPage: PdfPage = null;
        let index: number = section.indexOf(this.currentPage);
        if (index === section.count - 1) {
            nextPage = (section.add() as PdfPage);
        } else {
            nextPage = (section.getPages()[index + 1] as PdfPage);
        }
        this.currentGraphics = nextPage.graphics;
        this.currentBounds = new RectangleF(new PointF(0, 0), nextPage.getClientSize());
        return nextPage;
    }

    private getLayoutResult(): PdfTreeGridLayoutResult {
        let bounds: RectangleF = new RectangleF(this.startLocation, new SizeF(this.currentBounds.width, this.currentBounds.y -
            this.startLocation.y));
        return new PdfTreeGridLayoutResult(this.currentPage, bounds);
    }

    private checkIfDefaultFormat(format: PdfStringFormat): boolean {
        let defaultFormat: PdfStringFormat = new PdfStringFormat();
        return (format.alignment === defaultFormat.alignment && format.characterSpacing === defaultFormat.characterSpacing &&
            format.clipPath === defaultFormat.clipPath && format.firstLineIndent === defaultFormat.firstLineIndent &&
            format.horizontalScalingFactor === defaultFormat.horizontalScalingFactor &&
            format.lineAlignment === defaultFormat.lineAlignment
            && format.lineLimit === defaultFormat.lineLimit && format.lineSpacing === defaultFormat.lineSpacing &&
            format.measureTrailingSpaces === defaultFormat.measureTrailingSpaces && format.noClip === defaultFormat.noClip &&
            format.paragraphIndent === defaultFormat.paragraphIndent && format.rightToLeft === defaultFormat.rightToLeft &&
            format.subSuperScript === defaultFormat.subSuperScript && format.wordSpacing === defaultFormat.wordSpacing &&
            format.wordWrap === defaultFormat.wordWrap);
    }

    private drawRow(row: PdfTreeGridRow, layoutResult?: RowLayoutResult, height?: number): RowLayoutResult {
        //.. Check if required space available.
        //.....If the row conains spans which  falls through more than one page, then draw the row to next page.
        if (isNullOrUndefined(layoutResult)) {
            let result: RowLayoutResult = new RowLayoutResult();
            let height: number = row.rowBreakHeight > 0 ? row.rowBreakHeight : row.height;
            if (height > this.currentPageBounds.height) {
                if (this.treegrid.allowRowBreakAcrossPages) {
                    result.isFinish = true;
                    this.drawRowWithBreak(result, row, height);
                } else {
                    // If AllowRowBreakAcrossPages is not true, draw the row till it fits the page.
                    result.isFinish = false;
                    this.drawRow(row, result, height);
                }
            } else if (this.currentBounds.y + height > this.currentPageBounds.height ||
                this.currentBounds.y + height > this.currentBounds.height) {
                if (this.repeatRowIndex > -1 && this.repeatRowIndex === row.rowIndex) {
                    if (this.treegrid.allowRowBreakAcrossPages) {
                        result.isFinish = true;
                        this.drawRowWithBreak(result, row, height);
                    } else {
                        result.isFinish = false;
                        this.drawRow(row, result, height);
                    }
                } else {
                    result.isFinish = false;
                }
            } else {
                result.isFinish = true;
                this.drawRow(row, result, height);
            }
            return result;
        } else {
            let location: PointF = new PointF(this.currentBounds.x, this.currentBounds.y);
            layoutResult.bounds = new RectangleF(location, new SizeF(0, 0));
            let leftAdjustment: number = 0;
            height = this.reCalculateHeight(row, height);
            for (let i: number = this.cellStartIndex; i <= this.cellEndIndex; i++) {
                let cell: PdfTreeGridCell = row.cells.getCell(i);
                let column: PdfTreeGridColumn = this.treegrid.columns.getColumn(i);
                if (column.isTreeColumn) {
                    leftAdjustment = (row.level) * 10;
                }
                let cancelSpans: boolean = ((i > this.cellEndIndex + 1) && (cell.columnSpan > 1));
                if (!cancelSpans) {
                    for (let j: number = 1; j < cell.columnSpan; j++) {
                        row.cells.getCell(i + j).isCellMergeContinue = true;
                    }
                }
                let size: SizeF = new SizeF(column.width, height);
                if (!this.checkIfDefaultFormat(column.format) && this.checkIfDefaultFormat(cell.style.format)) {
                    cell.style.format = column.format;
                }
                /* tslint:disable-next-line */
                let stringResult: PdfStringLayoutResult = cell.draw(this.currentGraphics, new RectangleF(location, size), cancelSpans, leftAdjustment);
                /* tslint:disable-next-line */
                if (row.treegrid.style.allowHorizontalOverflow && (cell.columnSpan > this.cellEndIndex || i + cell.columnSpan > this.cellEndIndex + 1) && this.cellEndIndex < row.cells.count - 1) {
                    row.rowOverflowIndex = this.cellEndIndex;
                }
                location.x += column.width;
                leftAdjustment = 0;
            }
            this.currentBounds.y += height;
            /* tslint:disable-next-line */
            layoutResult.bounds = new RectangleF(new PointF(layoutResult.bounds.x, layoutResult.bounds.y), new SizeF(location.x, location.y));
            return null;
        }
    }
    /**
     * 
     */
    private drawRowWithBreak(result: RowLayoutResult, row: PdfTreeGridRow, height: number): void {
        let location: PointF = new PointF(this.currentBounds.x, this.currentBounds.y);
        result.bounds = new RectangleF(location, new SizeF(0, 0));
        let leftAdjustment: number = 0;
        this.treegridHeight = this.currentBounds.height;
        // Calculate the remaining height.
        row.rowBreakHeight = this.currentBounds.y + height - this.currentBounds.height;
        // No need to explicit break if the row height is equal to treegrid height.
        for (let c: number = 0; c < row.cells.count; c++) {
            let cell: PdfTreeGridCell = row.cells.getCell(c);
            let cellHeight: number = cell.measureHeight();
            if (cellHeight === height && (cell.value as PdfTreeGrid) === null) {
                row.rowBreakHeight = this.currentBounds.y + height - this.currentBounds.height;
            }
        }
        for (let i: number = this.cellStartIndex; i <= this.cellEndIndex; i++) {
            let column: PdfTreeGridColumn = this.treegrid.columns.getColumn(i);
            if (column.isTreeColumn) {
                leftAdjustment = row.level * 10;
            }
            let cell: PdfTreeGridCell = row.cells.getCell(i);
            let cancelSpans: boolean = ((cell.columnSpan + i > this.cellEndIndex + 1) && (cell.columnSpan > 1));
            if (!cancelSpans) {
                for (let j: number = 1; j < cell.columnSpan; j++) {
                    row.cells.getCell(i + j).isCellMergeContinue = true;
                }
            }
            let tHeight: number = this.treegridHeight > 0 ? this.treegridHeight : this.currentBounds.height;
            let size: SizeF = new SizeF(column.width, tHeight);
            if (!this.checkIfDefaultFormat(column.format) && this.checkIfDefaultFormat(cell.style.format)) {
                cell.style.format = column.format;
            }
            /* tslint:disable-next-line */
            let stringResult: PdfStringLayoutResult = cell.draw(this.currentGraphics, new RectangleF(location, size), cancelSpans, leftAdjustment);
            result.isFinish = (!result.isFinish) ? result.isFinish : cell.finishedDrawingCell;
            location.x += column.width;
            leftAdjustment = 0;
            this.currentBounds.y += this.treegridHeight > 0 ? this.treegridHeight : height;
            result.bounds = new RectangleF(new PointF(result.bounds.x, result.bounds.y), new SizeF(location.x, location.y));
        }
    }
    /**
     * `Recalculate row height` for the split cell to be drawn.
     * @private
     */
    public reCalculateHeight(row: PdfTreeGridRow, height: number): number {
        let newHeight: number = 0;
        for (let i: number = this.cellStartIndex; i <= this.cellEndIndex; i++) {
            if (!isNullOrUndefined(row.cells.getCell(i).remainingString) ||
                row.cells.getCell(i).remainingString === '') {
                newHeight = Math.max(newHeight, row.cells.getCell(i).measureHeight());
            }
        }
        return Math.max(height, newHeight);
    }
}
export class PdfTreeGridLayoutResult extends PdfLayoutResult {
    /**
     * Constructor
     * @private
     */
    public constructor(page: PdfPage, bounds: RectangleF) {
        super(page, bounds);
    }
}
/**
 * `PdfGridLayoutFormat` class represents a flexible grid that consists of columns and rows.
 */
export class PdfTreeGridLayoutFormat extends PdfLayoutFormat {
    /**
     * Initializes a new instance of the `PdfGridLayoutFormat` class.
     * @private
     */
    public constructor(baseFormat?: PdfLayoutFormat) {
        if (typeof baseFormat === 'undefined') {
            super();
        } else {
            super(baseFormat);
        }
    }
}