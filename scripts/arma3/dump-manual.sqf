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

private _fnc_pedacos = {
    params ["_marca", "_id", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 700];
        diag_log text (format ["<<A3MANUAL>>%1|%2|%3", _marca, _id, _p]);
        _texto = _texto select [700];
    };
};

diag_log text "<<A3MANUAL>>INICIO|v1";

private _nCats = 0;
private _nTopicos = 0;

{
    private _cfgCat = _x;
    private _categoria = configName _cfgCat;
    _nCats = _nCats + 1;

    diag_log text (format ["<<A3MANUAL>>C|%1|%2",
        _categoria, (getText (_cfgCat >> "displayName")) call _fnc_lim]);

    {
        private _cfgH = _x;
        private _classe = configName _cfgH;
        private _id = format ["%1/%2", _categoria, _classe];

        diag_log text (format ["<<A3MANUAL>>H|%1|%2|%3|%4|%5",
            _id, _categoria, _classe,
            (getText (_cfgH >> "displayName")) call _fnc_lim,
            (getText (_cfgH >> "image")) call _fnc_lim]);

        ["HT", _id, (getText (_cfgH >> "description")) call _fnc_lim] call _fnc_pedacos;

        private _args = getArray (_cfgH >> "arguments");
        if (count _args > 0) then {
            ["HA", _id, (str _args) call _fnc_lim] call _fnc_pedacos;
        };

        _nTopicos = _nTopicos + 1;
    } forEach ("true" configClasses _cfgCat);
} forEach ("true" configClasses (configFile >> "CfgHints"));

diag_log text (format ["<<A3MANUAL>>PLACAR|%1|%2", _nCats, _nTopicos]);
diag_log text (format ["<<A3MANUAL>>FIM|%1", (diag_tickTime - _t0) toFixed 2]);

hint format ["Dump do manual pronto.\n%1 categorias . %2 topicos\n%3 s\n\nRode: python scripts/arma3/parse-manual.py",
    _nCats, _nTopicos, (diag_tickTime - _t0) toFixed 1];
