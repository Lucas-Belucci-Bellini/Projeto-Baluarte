private _t0 = diag_tickTime;

private _fnc_lim = {
    private _s = _this;
    if (isNil "_s") exitWith { "" };
    if !(_s isEqualType "") exitWith { str _s };
    _s = _s regexReplace ["\\", "/"];
    _s = _s regexReplace ["""", "'"];
    _s = _s regexReplace ["\|", "/"];
    _s = _s regexReplace ["[\r\n\t]+", " "];
    _s
};

private _RETRATO = ["picture", "icon", "texture", "editorpreview", "picturepreview",
    "uipicture", "logo", "image", "overviewpicture", "previewpicture", "portrait",
    "pictureshot", "picturemap", "picturelogo", "texturenoalpha"];

diag_log text "<<A3ICO>>INICIO|v1";

private _mapa = createHashMap;
private _prox = 0;
private _nClasses = 0;
private _nVinculos = 0;

private _pilha = [configFile];

while { count _pilha > 0 } do {
    private _c = _pilha deleteAt (count _pilha - 1);
    _nClasses = _nClasses + 1;

    {
        private _p = _x;
        if (isText _p) then {
            private _v = getText _p;
            private _b = toLower _v;
            if (_b find ".paa" > -1 || _b find ".pac" > -1) then {
                private _limpo = [_v] call _fnc_lim;
                private _chave = toLower _limpo;
                private _id = _mapa getOrDefault [_chave, -1];
                if (_id < 0) then {
                    _id = _prox;
                    _prox = _prox + 1;
                    _mapa set [_chave, _id];
                    diag_log text (format ["<<A3ICO>>I|%1|%2", _id, _limpo]);
                };
                private _nome = toLower (configName _p);
                if (_nome in _RETRATO) then {
                    diag_log text (format ["<<A3ICO>>R|%1|%2|%3",
                        [configName _c] call _fnc_lim, _nome, _id]);
                    _nVinculos = _nVinculos + 1;
                };
            };
        };
    } forEach (configProperties [_c, "true", false]);

    {
        _pilha pushBack _x;
    } forEach ("true" configClasses _c);

    if (_nClasses % 20000 == 0) then {
        diag_log text (format ["<<A3ICO>>ANDAMENTO|%1|%2|%3",
            _nClasses, _prox, (diag_tickTime - _t0) toFixed 1]);
    };
};

diag_log text (format ["<<A3ICO>>PLACAR|%1|%2|%3", _nClasses, _prox, _nVinculos]);
diag_log text (format ["<<A3ICO>>FIM|%1", (diag_tickTime - _t0) toFixed 2]);

hint format ["Dump de icones pronto.\n%1 classes varridas\n%2 imagens distintas . %3 retratos\n%4 s\n\nRode: python scripts/arma3/parse-icones.py",
    _nClasses, _prox, _nVinculos, (diag_tickTime - _t0) toFixed 1];
