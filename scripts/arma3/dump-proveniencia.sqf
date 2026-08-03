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

private _fnc_num = { if (isNumber _this) then { str (getNumber _this) } else { "" } };

private _fnc_pedacos = {
    params ["_marca", "_id", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 700];
        diag_log text (format ["<<A3PROV>>%1|%2|%3", _marca, _id, _p]);
        _texto = _texto select [700];
    };
};

diag_log text "<<A3PROV>>INICIO|v1";

private _nP = 0; private _nM = 0;

{
    private _c = _x;
    private _addon = configName _c;

    diag_log text (format ["<<A3PROV>>P|%1|%2|%3|%4",
        _addon,
        (getText (_c >> "author")) call _fnc_lim,
        (getText (_c >> "name")) call _fnc_lim,
        (_c >> "requiredVersion") call _fnc_num]);

    ["PR", _addon, (str (getArray (_c >> "requiredAddons"))) call _fnc_lim] call _fnc_pedacos;
    ["PU", _addon, (str (getArray (_c >> "units"))) call _fnc_lim] call _fnc_pedacos;
    ["PW", _addon, (str (getArray (_c >> "weapons"))) call _fnc_lim] call _fnc_pedacos;
    _nP = _nP + 1;
} forEach ("true" configClasses (configFile >> "CfgPatches"));

{
    private _c = _x;
    diag_log text (format ["<<A3PROV>>M|%1|%2|%3|%4|%5|%6|%7",
        configName _c,
        (getText (_c >> "name")) call _fnc_lim,
        (getText (_c >> "dir")) call _fnc_lim,
        (getText (_c >> "author")) call _fnc_lim,
        (_c >> "appId") call _fnc_num,
        (str (getArray (_c >> "dlcColor"))) call _fnc_lim,
        (getText (_c >> "logo")) call _fnc_lim]);
    _nM = _nM + 1;
} forEach ("true" configClasses (configFile >> "CfgMods"));

diag_log text (format ["<<A3PROV>>PLACAR|%1|%2", _nP, _nM]);
diag_log text (format ["<<A3PROV>>FIM|%1", (diag_tickTime - _t0) toFixed 2]);

hint format ["Dump de proveniencia pronto.\n%1 addons . %2 mods/DLCs\n%3 s\n\nRode: python scripts/arma3/parse-proveniencia.py",
    _nP, _nM, (diag_tickTime - _t0) toFixed 1];
