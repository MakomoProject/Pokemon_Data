/**
 * Auther: MaiJZ
 * Date: 2017-04-04
 * Github: https://github.com/maijz128
 */


gData = {
    PokesData: null,
    Types: null,
    Moves: null,
    Natures: null,
    Resources: null
};

function classExtend(source, target) {
    var self = source;
    for (var att in target) {
        self[att] = target[att];
    }
    return source;
}
function classCombine(source, target) {
    var self = source;
    for (var att in target) {
        self[att] = target[att] || self[att];
    }
    return source;
}

const FIRST_LANG = 'zh-cn';
var Values = (function () {
    function Values(path) {
        var self = this;
        self.strings = null;
        self.path = path;

        self.ValueList.push(this);
        //self._changeLang();
    }

    Values.prototype.Lang = {
        currentLang: FIRST_LANG
    };
    Values.prototype.ValueList = [];
    Values.prototype._changeLang = function () {
        var self = this;
        const l = self.path[self.path.length - 1];
        const langName = self.Lang.currentLang;
        var url = '';
        if (l == '/' || l == '\\') {
            url = self.path + 'values/strings-' + langName + '.json';
        } else {
            url = self.path + '/values/strings-' + langName + '.json';
        }
        return fetch(url).then(function (response) {
            return response.json();
        }).then(function (data) {
            if (self.strings) {
                self.strings = classCombine(self.strings, data);
            } else {
                self.strings = data;
            }
        });
    };
    Values.prototype.changeLang = function (langName, isUpdateAll) {
        if (langName) {
            this.Lang.currentLang = langName;
            if (isUpdateAll) {
                for (var i in this.ValueList) {
                    const value = this.ValueList[i];
                    value._changeLang();
                }
            } else {
                return this._changeLang();
            }
        }
    };
    Values.prototype.getValue = function (key) {
        return this.strings[key];
    };
    Values.prototype.getValues = function () {
        return this.strings;
    };
    return Values;
})();

var Type = (function () {
    function Type(codeName, data) {
        this.codeName = codeName;
        this.data = data;
    }

    Type.prototype.getName = function () {
        return gData.Types.getTypeName(this.codeName);
    };
    Type.prototype.getColor = function () {
        return this.data.color;
    };
    Type.prototype.getEffects = function () {
        return this.data.effects;
    };
    //  属性加成(属性相克)
    Type.prototype.getTypeAdd = function (moveType, pokeTypes) {
        var add = 1;
        const moveTypeEffects = moveType.getEffects();
        for (var i in pokeTypes) {
            const typeCodeName = pokeTypes[i].codeName;
            if (moveTypeEffects.hasOwnProperty(typeCodeName)) {
                var effect = moveTypeEffects[typeCodeName];
                effect = parseInt(effect) / 100;
                add *= effect;
            }
        }
        return add;
    };
    Type.prototype.getThisTypeAdd = function (pokeTypes) {
        return this.getTypeAdd(this, pokeTypes);
    };

    return Type;
})();
var Types = (function () {
    function Types(types, values) {
        var self = this;
        self.values = values;
        self.types = types;
        self._count = 0;
        self.codeNames = [];
        for (var codeName in types) {
            self.codeNames.push(codeName);
            self._count++;
        }
    }

    Types.prototype.TypeDict = {};
    Types.prototype.count = function () {
        return this._count;
    };
    Types.prototype.getCodeNames = function () {
        return this.codeNames;
    };
    Types.prototype.getTypes = function () {
        return this.types;
    };
    Types.prototype.getType = function (codeName) {
        return this.types[codeName];
    };
    Types.prototype.getTypeObj = function (codeName) {
        if (!this.TypeDict.hasOwnProperty(codeName)) {
            const data = this.getType(codeName);
            this.TypeDict[codeName] = new Type(codeName, data);
        }
        return this.TypeDict[codeName];
    };
    Types.prototype.getTypeObjs = function (codeNames) {
        var result = [];
        for (var i = 0; i < codeNames.length; i++) {
            const obj = this.getTypeObj(codeNames[i]);
            result.push(obj);
        }
        return result;
    };
    Types.prototype.getTypeName = function (codeName) {
        return this.values.getValue(codeName);
    };
    Types.prototype.getTypeNames = function (types) {
        var result = [];
        for (var i = 0; i < types.length; i++) {
            const name = this.getTypeName(types[i]);
            result.push(name);
        }
        return result;
    };

    return Types;
})();
function loadTypes() {
    const path = 'data/types/';
    const url = path + 'types.json';
    var values = new Values(path);
    return values.changeLang(FIRST_LANG).then(function () {
        return fetch(url);
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        return new Types(data, values);
    });
}

var Natures = (function () {
    function Natures(natures, values) {
        var self = this;
        self.values = values;
        self.natures = natures;
        self.naturesForID = null;
        self.naturesForCodeName = null;
    }

    Natures.prototype.getName = function (nature) {
        return this.values.getValue(nature.codeName);
    };
    Natures.prototype.getNature = function (codeName) {
        var self = this;
        if (self.naturesForCodeName === null) {
            self.naturesForCodeName = {};
            for (var key in self.natures) {
                var item = self.natures[key];
                self.naturesForCodeName[item.codeName] = item;
            }
        }
        return self.naturesForCodeName[codeName];
    };
    Natures.prototype.getNatures = function () {
        return this.natures;
    };
    Natures.prototype.getNatureForID = function (id) {
        var self = this;
        if (self.naturesForID === null) {
            self.naturesForID = {};
            for (var key in self.natures) {
                var item = self.natures[key];
                self.naturesForID[item.id] = item;
            }
        }
        return self.naturesForID[id];
    };
    Natures.prototype.getNatureEffects = function (codeName) {
        const n = this.getNature(codeName);
        if (n) {
            return n.effects;
        }
    };
    Natures.prototype.getNatureAdd = function (nature, speciesItem) {
        var add = 1;
        const effects = this.getNatureEffects(nature.codeName);
        if (effects.hasOwnProperty(speciesItem)) {
            var effect = effects[speciesItem];
            effect = parseInt(effect) / 100;
            add = effect;
        }
        return add;
    };
    Natures.prototype.count = function () {
        return this.natures.length;
    };

    return Natures;
})();
function loadNatures() {
    const path = 'data/natures/';
    const url = path + 'natures.json';
    var values = new Values(path);
    return values.changeLang(FIRST_LANG).then(function () {
        return fetch(url)
    }).then(function (response) {
        return response.json()
    }).then(function (data) {
        return new Natures(data, values);
    });
}


gData.init = function () {
    return Promise.all([loadNatures(), loadTypes()])
        .then(function (results) {
            gData.Natures = results[0];
            gData.Types = results[1];

            return 'load data done.'
        }).catch(function (error) {
            console.log(error);
            return error;
        });
};
