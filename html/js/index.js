/**
 * Auther: MaiJZ
 * Date: 2017/4/11
 * Github: https://github.com/maijz128
 */


window.onload = function () {

    gData.init().then(function (msg) {
        console.log(msg);
        regComponent();
        typesTable(gData.Types);
        naturesTable(gData.Natures);

    });
    console.log('load done.');
};


function regComponent() {
    Vue.component('c-type', {
        props: ['type'],
        template: '<div  class="c-type" ' +
        'v-bind:style="{backgroundColor: type.getColor()}"' +
        'v-bind:title="type.getName()"> ' +
        '{{type.getName()}}</div>'
    });
    Vue.component('c-types-table', {
        props: ['types', 'count', 'getEffect', 'getClass'],
        template: '' +
        '<div>' +
        '<table class="c-types-table"><tbody>' +
        '<tr> <th colspan="3" rowspan="2">Type</th>' +
        '<th class="c-types-table-head" :colspan="count" > <small>Defense</small>' +
        '</th></tr>' +
        '<tr>' +
        '<td v-for="type in types" :style="{backgroundColor : type.getColor()}">' +
        '<c-type :type="type"></c-type></td>' +
        '</tr>' +
        '<tr v-for="(type, index) in types">' +
        '<th v-if="index === 0" :rowspan="count"  colspan="2" class="c-types-table-left" > ' +
        '<small>A<br>t<br>t<br>a<br>c<br>k</small> </th>' +

        '<td :style="{backgroundColor : type.getColor()}"><c-type :type="type"></c-type></td>' +
        '<td v-for="target in types" :class="getClass(type, target)">{{getEffect(type, target)}}</td>' +
        '</tr>' +
        '</tbody></table>' +
        '</div>'
    });

    Vue.component('c-natures-table', {
        props: ['natures', 'species', 'getName', 'getEffect','getClass'],
        template: '' +
        '<div>' +
        '<table class="c-natures-table"><tbody>' +
        '<tr> <th colspan="1" rowspan="1">Nature</th>' +
        '<td  v-for="item in species" > <small>{{item}}</small>' +
        '</td></tr>' +

        '<tr v-for="(nature, index) in natures">' +

        '<td :title="getName(nature)">{{getName(nature)}}</td>' +
        '<td v-for="item in species" :class="getClass(nature, item)">{{getEffect(nature, item)}}</td>' +
        '</tr>' +
        '</tbody></table>' +
        '</div>'
    });
}

function typesTable(Types) {
    var self = {};
    self.Types = Types;
    self.codeNams = self.Types.getCodeNames();
    self.codeNams.shift();  // remove unknown
    self.data = {
        types: self.Types.getTypeObjs(self.codeNams),
        count: self.codeNams.length + 1,
        isUpdate: self.Types.values.getValues()
    };
    self.app = new Vue({
        el: '#c-types-table',
        data: self.data,
        methods: {
            getEffect: function (type1, type2) {
                return type1.getThisTypeAdd([type2]);
            },
            getClass: function (type1, type2) {
                const effect = type1.getThisTypeAdd([type2]);
                switch (effect) {
                    case  0 :
                        return 'c-types-table-zero';
                    case  0.5 :
                        return 'c-types-table-half';
                    case  2 :
                        return 'c-types-table-double';
                    default:
                        return 'c-types-table-normal';
                }
            }
        }
    });
    return self;
}

function naturesTable(Natures) {
    var self = {};
    self.Natures = Natures;
    self.data = {
        natures:self.Natures.getNatures(),
        species: ['atk', 'def', 'speed', 'spAtk', 'spDef'],
        isUpdate: self.Natures.values.getValues()
    };
    self.app = new Vue({
        el: '#c-natures-table',
        data: self.data,
        methods: {
            getEffect: function (nature, speciesItem) {
                const effect =self.Natures.getNatureAdd(nature, speciesItem);
                switch (effect) {
                    case  0.9 :
                        return '90%';
                    case  1.1 :
                        return '110%';
                    default:
                        return '-';
                }
            },
            getClass: function (nature, speciesItem) {
                const effect =self.Natures.getNatureAdd(nature, speciesItem);
                switch (effect) {
                    case  0.9 :
                        return 'c-natures-table-down';
                    case  1.1 :
                        return 'c-natures-table-up';
                    default:
                        return 'c-natures-table-normal';
                }
            },
            getName : function (nature) {
                return self.Natures.getName(nature);
            }
        }
    });
}

