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

private _fnc_num = { _this toFixed 4 };

private _fnc_n = {
    params ["_cfg", "_prop"];
    if (isNumber (_cfg >> _prop)) then {
        (getNumber (_cfg >> _prop)) toFixed 4
    } else {
        ""
    };
};

private _fnc_pedacos = {
    params ["_marca", "_classe", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 700];
        diag_log text (format ["<<A3CAT>>%1|%2|%3", _marca, _classe, _p]);
        _texto = _texto select [700];
    };
};

diag_log text "<<A3CAT>>INICIO|v1";

private _nVei = 0;
private _nHom = 0;
private _nMoc = 0;
private _nItem = 0;
private _nOc = 0;

private _fnc_categoria = {
    params ["_c"];
    if (_c isKindOf "Bag_Base") exitWith { "mochila" };
    if (_c isKindOf "CAManBase") exitWith { "soldado" };
    if (_c isKindOf "StaticWeapon") exitWith { "estatico" };
    if (_c isKindOf "Plane") exitWith { "aviao" };
    if (_c isKindOf "Helicopter") exitWith { "helicoptero" };
    if (_c isKindOf "Ship") exitWith { "naval" };
    if (_c isKindOf "Tank") exitWith { "blindado" };
    if (_c isKindOf "Wheeled_APC_F") exitWith { "blindado" };
    if (_c isKindOf "Car") exitWith { "viatura" };
    if (_c isKindOf "Motorcycle") exitWith { "moto" };
    if (_c isKindOf "Submarine_F") exitWith { "naval" };
    if (_c isKindOf "UAV") exitWith { "drone" };
    ""
};

private _veiculos = "
    (getNumber (_x >> 'scope') >= 2) &&
    {(getText (_x >> 'displayName')) != ''}
" configClasses (configFile >> "CfgVehicles");

{
    private _cfg = _x;
    private _classe = configName _cfg;
    private _cat = [_classe] call _fnc_categoria;

    if (_cat != "") then {
        diag_log text (format ["<<A3CAT>>V|%1|%2|%3|%4|%5|%6|%7",
            _classe,
            (getText (_cfg >> "displayName")) call _fnc_lim,
            _cat,
            (configSourceMod _cfg) call _fnc_lim,
            [_cfg, "side"] call _fnc_n,
            (getText (_cfg >> "faction")) call _fnc_lim,
            [_cfg, "scope"] call _fnc_n
        ]);

        private _pic = getText (_cfg >> "picture");
        if (_pic == "") then { _pic = getText (_cfg >> "editorPreview") };
        if (_pic == "") then { _pic = getText (_cfg >> "icon") };
        diag_log text (format ["<<A3CAT>>VP|%1|%2|%3",
            _classe,
            _pic call _fnc_lim,
            (getText (_cfg >> "model")) call _fnc_lim
        ]);

        if (_cat == "mochila") then {
            diag_log text (format ["<<A3CAT>>VB|%1|%2|%3",
                _classe,
                [_cfg, "maximumLoad"] call _fnc_n,
                [_cfg, "mass"] call _fnc_n
            ]);
            _nMoc = _nMoc + 1;
        } else {
            if (_cat == "soldado") then {
                private _arm = (getArray (_cfg >> "weapons") select { _x isEqualType "" }) joinString ";";
                diag_log text (format ["<<A3CAT>>VH|%1|%2|%3|%4|%5",
                    _classe,
                    (getText (_cfg >> "uniformClass")) call _fnc_lim,
                    [_cfg, "armor"] call _fnc_n,
                    [_cfg, "engineer"] call _fnc_n,
                    [_cfg, "attendant"] call _fnc_n
                ]);
                ["VW", _classe, _arm] call _fnc_pedacos;
                _nHom = _nHom + 1;
            } else {
                diag_log text (format ["<<A3CAT>>VD|%1|%2|%3|%4|%5|%6|%7",
                    _classe,
                    [_cfg, "armor"] call _fnc_n,
                    [_cfg, "maxSpeed"] call _fnc_n,
                    [_cfg, "fuelCapacity"] call _fnc_n,
                    [_cfg, "transportSoldier"] call _fnc_n,
                    [_cfg, "crewCrashProtection"] call _fnc_n,
                    [_cfg, "mass"] call _fnc_n
                ]);
                private _tur = (getArray (_cfg >> "weapons") select { _x isEqualType "" }) joinString ";";
                ["VT", _classe, _tur] call _fnc_pedacos;
                _nVei = _nVei + 1;
            };
        };
    };
} forEach _veiculos;

private _itens = "
    (getNumber (_x >> 'scope') >= 2) &&
    {(getNumber (_x >> 'type')) == 131 || {isClass (_x >> 'ItemInfo')}}
" configClasses (configFile >> "CfgWeapons");

private _fnc_tipoItem = {
    params ["_t"];
    if (_t == 101) exitWith { "boca" };
    if (_t == 201) exitWith { "apontador" };
    if (_t == 301) exitWith { "mira" };
    if (_t == 302) exitWith { "bipe" };
    if (_t == 401) exitWith { "coldre" };
    if (_t == 601) exitWith { "capacete" };
    if (_t == 605) exitWith { "capacete" };
    if (_t == 611) exitWith { "radio" };
    if (_t == 616) exitWith { "binoculo" };
    if (_t == 617) exitWith { "gps" };
    if (_t == 619) exitWith { "bussola" };
    if (_t == 620) exitWith { "visao-noturna" };
    if (_t == 621) exitWith { "relogio" };
    if (_t == 701) exitWith { "colete" };
    if (_t == 801) exitWith { "uniforme" };
    ""
};

{
    private _cfg = _x;
    private _classe = configName _cfg;
    private _ii = _cfg >> "ItemInfo";
    private _tipoNum = getNumber (_ii >> "type");
    private _tipo = [_tipoNum] call _fnc_tipoItem;

    if (_tipo != "") then {
        diag_log text (format ["<<A3CAT>>I|%1|%2|%3|%4|%5|%6",
            _classe,
            (getText (_cfg >> "displayName")) call _fnc_lim,
            _tipo,
            (configSourceMod _cfg) call _fnc_lim,
            [_ii, "mass"] call _fnc_n,
            _tipoNum
        ]);
        diag_log text (format ["<<A3CAT>>IP|%1|%2|%3",
            _classe,
            (getText (_cfg >> "picture")) call _fnc_lim,
            (getText (_ii >> "model")) call _fnc_lim
        ]);

        private _desc = (getText (_cfg >> "descriptionShort")) call _fnc_lim;
        if (count _desc > 90) then { _desc = _desc select [0, 90] };
        ["ID", _classe, _desc] call _fnc_pedacos;

        if (_tipo == "mira") then {
            private _modos = [];
            {
                private _m = _x;
                _modos pushBack format ["%1:%2:%3:%4:%5",
                    configName _m,
                    [_m, "opticsZoomMin"] call _fnc_n,
                    [_m, "opticsZoomMax"] call _fnc_n,
                    [_m, "discreteDistanceInitIndex"] call _fnc_n,
                    ((getArray (_m >> "visionMode") select { _x isEqualType "" }) joinString "+")
                ];
            } forEach ("true" configClasses (_ii >> "OpticsModes"));
            ["IO", _classe, _modos joinString ";"] call _fnc_pedacos;
        };

        if (_tipo == "colete" || {_tipo == "uniforme"} || {_tipo == "capacete"}) then {
            private _prot = [];
            {
                private _hp = _x;
                _prot pushBack format ["%1:%2:%3",
                    (getText (_hp >> "hitpointName")) call _fnc_lim,
                    [_hp, "armor"] call _fnc_n,
                    [_hp, "passThrough"] call _fnc_n
                ];
            } forEach ("true" configClasses (_ii >> "HitpointsProtectionInfo"));
            ["IA", _classe, _prot joinString ";"] call _fnc_pedacos;

            diag_log text (format ["<<A3CAT>>IC|%1|%2|%3",
                _classe,
                (getText (_ii >> "containerClass")) call _fnc_lim,
                [(configFile >> "CfgVehicles" >> (getText (_ii >> "containerClass"))), "maximumLoad"] call _fnc_n
            ]);
        };
        _nItem = _nItem + 1;
    };
} forEach _itens;

private _oculos = "
    (getNumber (_x >> 'scope') >= 2) &&
    {(getText (_x >> 'displayName')) != ''}
" configClasses (configFile >> "CfgGlasses");

{
    private _cfg = _x;
    diag_log text (format ["<<A3CAT>>G|%1|%2|%3|%4|%5",
        configName _cfg,
        (getText (_cfg >> "displayName")) call _fnc_lim,
        (configSourceMod _cfg) call _fnc_lim,
        (getText (_cfg >> "picture")) call _fnc_lim,
        [_cfg, "mass"] call _fnc_n
    ]);
    _nOc = _nOc + 1;
} forEach _oculos;

private _dt = diag_tickTime - _t0;
diag_log text (format ["<<A3CAT>>FIM|%1|%2|%3|%4|%5|%6", _nVei, _nHom, _nMoc, _nItem, _nOc, _dt toFixed 1]);

private _msg = format ["CATALOGO OK em %1 s - %2 veiculos, %3 soldados, %4 mochilas, %5 itens, %6 oculos. Rode: python scripts/arma3/parse-catalogo.py",
    _dt toFixed 1, _nVei, _nHom, _nMoc, _nItem, _nOc];
hint _msg;
systemChat _msg;
copyToClipboard _msg;
_msg
