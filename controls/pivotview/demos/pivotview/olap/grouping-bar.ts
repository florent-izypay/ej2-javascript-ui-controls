/**
 * Pivot Field List Default Sample
 */

import { PivotView } from '../../../src/pivotview/base/pivotview';
import { GroupingBar } from '../../../src/common/grouping-bar/grouping-bar';
import { FieldList } from '../../../src/common/actions/field-list';
import { CalculatedField } from '../../../src/common/calculatedfield/calculated-field';
import '../../../node_modules/es6-promise/dist/es6-promise';

PivotView.Inject(GroupingBar, FieldList, CalculatedField);
let pivotGridObj: PivotView = new PivotView({
    dataSourceSettings: {
        // catalog: 'FoodMart',
        // cube: 'Sales',
        // url: 'http://olap.flexmonster.com:8080/mondrian/xmla',


        // catalog: 'Adventure Works DW 2008 SE',
        // catalog: 'Adventure Works DW Standard Edition',
        catalog: 'Adventure Works DW 2008R2',
        // catalog: 'Sales',
        // catalog: 'FoodMart',

        cube: 'Adventure Works',
        // cube: 'Sales',

        providerType: 'SSAS',

        // url: 'https://bi.syncfusion.com/olap/msmdpump.dll',
        // url: 'https://olap.flexmonster.com/olap/msmdpump.dll',
        url: 'https://demos.telerik.com/olap/msmdpump.dll',
        // url: 'http://52.4.22.157:8282/icCube/xmla',
        // url: 'http://olap.flexmonster.com:8282/icCube/xmla',
        // url: 'https://demos.devexpress.com/Services/OLAP/msmdpump.dll',
        // url: 'http://olap.flexmonster.com:8080/mondrian/xmla',  
        localeIdentifier: 1033,
        drilledMembers: [
            // {
            //     name: '[Date].[Fiscal]',
            //     items: ['[Date].[Fiscal].[Fiscal Year].&[2002]',
            //         '[Date].[Fiscal].[Fiscal Semester].&[2002]&[2]',
            //         '[Date].[Fiscal].[Fiscal Year].&[2005]']
            // },
            // {
            //     name: '[Date].[Fiscal]',
            //     items: ['[Date].[Fiscal].[Fiscal Year].&[2010]',
            //         '[Date].[Fiscal].[Fiscal Semester].&[2010]&[2]',
            //         '[Date].[Fiscal].[Fiscal Year].&[2012]']
            // },
            {
                name: '[Date].[Fiscal]',
                items: ['[Date].[Fiscal].[Fiscal Year].&[2006]',
                    '[Date].[Fiscal].[Fiscal Semester].&[2006]&[2]',
                    '[Date].[Fiscal].[Fiscal Year].&[2008]']
            },
            {
                name: '[Customer].[Customer Geography]',
                items: ['[Customer].[Customer Geography].[Country].&[Australia]',
                    '[Customer].[Customer Geography].[State-Province].&[NSW]&[AU]'], delimiter: '##'
            },
            {
                name: '[Geography].[Geography]',
                items: ['[Geography].[Geography].[Country].&[Australia]',
                    '[Geography].[Geography].[State-Province].&[NSW]&[AU]'], delimiter: '##'
            }
        ],
        allowLabelFilter: true,
        allowValueFilter: true,
        filterSettings: [
            {
                name: '[Customer].[Customer Geography]',
                items: ['[Customer].[Customer Geography].[State-Province].&[NSW]&[AU]',
                    '[Customer].[Customer Geography].[State-Province].&[QLD]&[AU]',
                    '[Customer].[Customer Geography].[Country].&[Germany]',
                    '[Customer].[Customer Geography].[Country].&[France]',
                    '[Customer].[Customer Geography].[Country].&[United Kingdom]',
                    '[Customer].[Customer Geography].[Country].&[United States]'],
                levelCount: 2
            },
            // {
            //     name: '[Date].[Fiscal]',
            //     selectedField: '[Date].[Fiscal].[Fiscal Semester]',
            //     condition: 'Contains',
            //     value1: 'h1 fy 2002',
            //     type: 'Label'
            // },
            // {
            //     name: '[Date].[Fiscal]',
            //     selectedField: '[Date].[Fiscal].[Fiscal Year]',
            //     condition: 'Contains',
            //     value1: '2002',
            //     type: 'Label'
            // },
            // {
            //     name: '[Date].[Fiscal]',
            //     selectedField: '[Date].[Fiscal].[Fiscal Semester]',
            //     condition: 'Contains',
            //     value1: 'h2 fy 2010',
            //     type: 'Label'
            // },
            // {
            //     name: '[Date].[Fiscal]',
            //     selectedField: '[Date].[Fiscal].[Fiscal Year]',
            //     condition: 'Contains',
            //     value1: '2010',
            //     type: 'Label'
            // },
            // { name: '[Employee].[Employee Department]', items: ['[Employee].[Employee Department].[Title].&[Control Specialist]'], levelCount: 3 },
            // { name: '[Date].[Fiscal]', items: ['[Date].[Fiscal].[Fiscal Quarter].&[2012]&[4]', '[Date].[Fiscal].[Fiscal Year].&[2010]'], levelCount: 3 },
        ],
        rows: [
            //     // { name: '[Customers].[Geography]' },
            //     { name: '[Geography].[Geography]', caption: 'Geography' },
            { name: '[Date].[Fiscal]', caption: 'Date Fiscal' },
            // { name: 'BikeAndComponents', caption: 'Bike And Components', isCalculatedField: true }
            // { name: '[Customer].[Customer Geography]', caption: 'Customer Geography' },
            // { name: '[Employee].[Employee Department]', caption: 'Employee Department' }
            //     // { name: '[Product].[Category]', caption: 'Product Category' },
            //     // { name: '[Product].[Subcategory]' },

        ],
        columns: [
            //     // { name: '[Product].[Product]'}
            // { name: '[Product].[Category]', caption: 'Product Category' },
            { name: '[Customer].[Customer Geography]', caption: 'Customer Geography' },
            // { name: '[Geography].[Geography]', caption: 'Geography' },
            //     // { name: '[Department].[Departments]', caption: 'Departments' },
            { name: '[Measures]', caption: 'Measures' },
            //     // { name: '[Core Product Group]', isNamedSet: true },
            //     // { name: '[Ship Date].[Calendar Year]' },
            //     // { name: '[Ship Date].[Month of Year]' },
        ],
        values: [
            //     // { name: '[Measures].[Amount]' },
            { name: '[Measures].[Customer Count]', caption: 'Customer Count' },
            // { name: '[Measures].[Reseller Order Count]', caption: 'Reseller Order Count' },
            //     { name: '[Measures].[Discount Amount]', caption: 'Discount Amount' }
            //     // { name: '[Measures].[Product Gross Profit Margin Status]', caption: 'Profit Margin Status' },
            { name: '[Measures].[Internet Sales Amount]', caption: 'Internet Sales Amount' },
            // { name: 'Order on Discount', caption: 'Order on Discount', isCalculatedField: true }
        ],
        filters: [
            // { name: '[Employee].[Employee Department]', caption: 'Employee Department' },
            // { name: '[Customer].[Customer]', caption: 'Customer' }
        ],
        // formatSettings: [ { name: '[Measures].[Customer Count]', format: 'P' }],
        // emptyCellsTextContent: '*',
        valueAxis: 'column',
        valueSortSettings: {
            sortOrder: 'Descending',
            measure: '[Measures].[Internet Sales Amount]'
        }
    },
    enableVirtualization: false,
    showGroupingBar: true,
    showFieldList: true,
    width: '80%',
    height: '500px',
    groupingBarSettings: {
        allowDragAndDrop: true
    }
});

pivotGridObj.appendTo('#PivotView');