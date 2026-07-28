private _t0 = diag_tickTime;

private _fnc_sub = {
    private _s = _this;
    if (isNil "_s") exitWith { "" };
    if !(_s isEqualType "") exitWith { str _s };
    _s = _s regexReplace ["[|;:]", " "];
    _s = _s regexReplace ["[\r\n\t]+", " "];
    _s
};

private _fnc_pedacos = {
    params ["_marca", "_arma", "_slot", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 640];
        diag_log text (format ["<<A3ACC>>%1|%2|%3|%4", _marca, _arma, _slot, _p]);
        _texto = _texto select [640];
    };
};

diag_log text "<<A3ACC>>INICIO|v2";

private _armas = "
    (getNumber (_x >> 'scope') >= 2) &&
    {(getNumber (_x >> 'type')) in [1, 2, 4]}
" configClasses (configFile >> "CfgWeapons");

private _fnc_compat = compile "compatibleItems _this";
private _temEngine = false;
if (count _armas > 0) then {
    private _probe = nil;
    _probe = (configName (_armas select 0)) call _fnc_compat;
    if (!isNil "_probe") then {
        if (_probe isEqualType []) then { _temEngine = true };
    };
};
diag_log text (format ["<<A3ACC>>ENGINE|%1", _temEngine]);

private _nArmas = 0;
private _nPares = 0;
private _nEng = 0;

{
    private _cfg = _x;
    private _classe = configName _cfg;
    private _wsi = _cfg >> "WeaponSlotsInfo";
    private _nSlots = 0;

    {
        private _slot = (configName _x) call _fnc_sub;
        private _itens = [];
        {
            if (_x isEqualType "") then { _itens pushBack (_x call _fnc_sub) };
        } forEach (getArray (_x >> "compatibleItems"));

        if (count _itens > 0) then {
            ["S", _classe, _slot, _itens joinString ";"] call _fnc_pedacos;
            _nSlots = _nSlots + 1;
            _nPares = _nPares + count _itens;
        } else {
            diag_log text (format ["<<A3ACC>>SV|%1|%2", _classe, _slot]);
        };
    } forEach ("true" configClasses _wsi);

    if (_temEngine) then {
        private _lista = _classe call _fnc_compat;
        if (!isNil "_lista") then {
            private _eng = [];
            {
                if (_x isEqualType "") then { _eng pushBack (_x call _fnc_sub) };
            } forEach _lista;
            if (count _eng > 0) then {
                ["SE", _classe, "engine", _eng joinString ";"] call _fnc_pedacos;
                _nEng = _nEng + count _eng;
            };
        };
    };

    diag_log text (format ["<<A3ACC>>N|%1|%2", _classe, _nSlots]);
    _nArmas = _nArmas + 1;
} forEach _armas;

private _dt = diag_tickTime - _t0;
diag_log text (format ["<<A3ACC>>FIM|%1|%2|%3|%4", _nArmas, _nPares, _dt toFixed 1, _nEng]);

private _msg = format ["DUMP ACESSORIOS OK em %1 s - %2 armas, %3 pares do config, %4 pares do engine. Rode: python scripts/arma3/parse-acessorios.py",
    _dt toFixed 1, _nArmas, _nPares, _nEng];
hint _msg;
systemChat _msg;
copyToClipboard _msg;
_msg
