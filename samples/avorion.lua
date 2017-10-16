--Example autocomplete, for Avorion's Scripting API
--The autocomplete, will work only on LUA files.
--For ATOM your required to have language-lua package so atom can identify lua files properly.

Entity(index):hasComponent(type)
local id = Entity(index).index

--ATOM Autocomplete for AVORION scripting API

local id = Entity().index

function initialize()

end
