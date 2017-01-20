"use strict";

var D2_API_KEY="CF1A4219A8407493ABAD29C0614BEE53";
var dota2_webapi_url="http://api.steampowered.com/IEconDOTA2_570";
var dota2_webapi_url_heroes = dota2_webapi_url + "/GetHeroes/v1?key=" + D2_API_KEY + "&language=en";
var dota2_webapi_url_items = dota2_webapi_url + "/GetGameItems/v1?key=" + D2_API_KEY + "&language=en";
var dota2_base_image_url = "http://cdn.dota2.com/apps/dota2/images";
var dota2_base_image_url_heroes = dota2_base_image_url + "/heroes/";
var dota2_base_image_url_abilities = dota2_base_image_url + "/abilities/";
var dota2_base_image_url_items = dota2_base_image_url + "/items/";

var jsfeed_heropickerdata_url = "http://www.dota2.com/jsfeed/heropickerdata";
var jsfeed_abilitydata_url = "http://www.dota2.com/jsfeed/abilitydata";
var jsfeed_itemdata_url = "http://www.dota2.com/jsfeed/itemdata";
var jsfeed_heropediadata_url = "http://www.dota2.com/jsfeed/heropediadata";

var dotabuff_heroes_url = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_heroes.json";
var dotabuff_abilities_url = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_abilities.json";
var dotabuff_items_url = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/items.json";

var heroes_json_file = "./public/dotowiki_heroes.json";
var items_json_file = "./public/dotowiki_items.json";

class Hero {
  constructor() {
    // Name
    this.name = "";
    this.short_name = "";
    this.localized_name = "";

    // Image
    this.icon_url = "";
    this.portrait_url = "";
    this.small_horizontal_portrait = "";
    this.large_horizontal_portrait = "";
    this.full_quality_horizontal_portrait = "";
    this.full_quality_vertical_portrait = "";

    // Stat
    this.armorPhysical = -1;
    this.magicalResistance = 25;
    this.attackDamageMin = 1;
    this.attackDamageMax = 1;
    this.attackRate = 1.7;
    this.attackAnimationPoint = 0.75;
    this.attackAcquisitionRange = 800;
    this.attackRange = 600;
    this.attributePrimary = "DOTA_ATTRIBUTE_STRENGTH";
    this.attributeBaseStrength = 0;
    this.attributeStrengthGain = 0;
    this.attributeBaseIntelligence = 0;
    this.attributeIntelligenceGain = 0;
    this.attributeBaseAgility = 0;
    this.attributeAgilityGain = 0;
    this.movementSpeed = 300;
    this.movementTurnRate = 0.500000;
    this.statusHealth = 200;
    this.statusHealthRegen = 0.250000;
    this.statusMana = 50;
    this.statusManaRegen = 0.010000;
    this.visionDaytimeRange = 1800;
    this.visionNighttimeRange = 800;

    // Abilities
    this.abilities = [];

    // Others
    this.role = "";
    this.team = "Good";
    this.legs = 2;
    this.lore = "";
  }
}

class Ability {
  constructor() {
    this.id = "";
    this.key = "";
    this.name = "";
    this.full_name = "";
    this.icon_url = "";
    this.portrait_url = "";
    this.description = "";
    this.affects = "";
    this.damage = "";
    this.attribute = "";
    this.cooldownAndManacost = "";
    this.notes = "";
    this.lore = "";
  }
}

class ItemDescription {
  constructor() {
    this.text = "";
    this.parameters = {};
  }
}

class Item {
  constructor() {
    this.id = 0;
    this.name = "";
    this.short_name = "";
    this.localized_name = "";
    this.icon_url = "";
    this.portrait_url = "";
    this.cost = 0;
    this.isRecipe = false;
    this.inSecretShop = false;
    this.inSideShop = false;
    this.description = new ItemDescription();
    this.attribute = "";
    this.manacost = 0;
    this.cooldown = 0;
    this.notes = "";
    this.lore = "";
    this.components = [];
  }
}

function returnJSON(res, data) {
  // console.log("Getting data is done!");
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
}

function sayHello() {
  console.log("Hello from the other side!");
}

function sayBye() {
  console.log("Bye bye bye!");
}

var fs = require('fs');

function saveFile(file_path, data) {
  fs.exists(file_path, function(exists) {
    if (exists) {
      console.log(file_path + " existed!");
    } else {
      console.log(file_path + " does not exist!");
    }
    console.log("Writing " + file_path + "...");
    fs.writeFile(file_path, data, function(error) {
      if (error) {
        console.log(error);
      } else {
        console.log("OK!");
      }
    });
  });
}

var striptags = require("striptags");

function stripHTML(input_string) {
  // TODO: Short this statement
  return striptags(input_string.replace("<br />", "\r\n").replace("<br/>", "\r\n").replace("<br></br>", "\r\n"));
}

function collectHeroes() {
  // Get hero list from official web api of dota 2 to ensure data is newest
  var url = dota2_webapi_url_heroes;
  console.log("Get data from " + url + "...");
  request(url, function(error, response, data) {
    if (error) {
      return console.log(error);
    }
    if (response.statusCode !== 200) {
      return console.log(response.statusCode);
    }
    // console.log(data);
    // console.log("Getting data from " + url + " is done!");
    data = JSON.parse(data);
    // console.log(data.result.status);
    if (data.result.status === 200) {
      // Reset hero list
      var heroes = [];
      for (var record of data.result.heroes) {
        // console.log(record.name);
        var hero = new Hero();
        hero.name = record.name;
        // Remove "npc_dota_hero_" from name
        hero.short_name = record.name.replace("npc_dota_hero_", "");
        hero.localized_name = record.localized_name;

        // Add image url for each hero
        // 59x33px
        hero.small_horizontal_portrait = dota2_base_image_url_heroes + hero.short_name + "_sb.png";
        // 205x11px
        hero.large_horizontal_portrait = dota2_base_image_url_heroes + hero.short_name + "_lg.png";
        // 256x114px
        hero.full_quality_horizontal_portrait = dota2_base_image_url_heroes + hero.short_name + "_full.png";
        // 234x272px
        hero.full_quality_vertical_portrait = dota2_base_image_url_heroes + hero.short_name + "_vert.jpg";
        hero.icon_url = hero.small_horizontal_portrait;
        hero.portrait_url = hero.full_quality_vertical_portrait;

        // Push data of new hero to end of the array
        heroes.push(hero);
      }

      // Ensure there is at least one hero
      if (heroes.length) {
        var counter = 2; // A counter used to ensure we collected all data
        // Get bio of each hero from http://www.dota2.com/jsfeed/heropickerdata
        url = jsfeed_heropickerdata_url;
        console.log("Get data from " + url + "...");
        request(url, function(error, response, data) {
          if (error) {
            return console.log(error);
          }
          if (response.statusCode !== 200) {
            return console.log(response.statusCode);
          }
          // console.log("Getting data from " + url + " is done!");
          data = JSON.parse(data);
          // console.log(heroes.length);
          heroes.forEach(function(hero, index) {
            if (data[hero.short_name]) {
              heroes[index].lore = stripHTML(data[hero.short_name].bio);
            }
          });
          counter--;
          if (counter == 0) {
            // returnJSON(res, heroes);
            // heroes_data = heroes;
            saveFile(heroes_json_file, JSON.stringify(heroes));
          }
        });

        // Get information of abilities from http://www.dota2.com/jsfeed/abilitydata
        var abilities = {};
        url = jsfeed_abilitydata_url;
        console.log("Get data from " + url + "...");
        request(url, function(error, response, data) {
          if (error) {
            return console.log(error);
          }
          if (response.statusCode !== 200) {
            return console.log(response.statusCode);
          }
          // console.log("Getting data from " + url + " is done!");
          abilities = (JSON.parse(data)).abilitydata;

          // Get information of abilities from https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_abilities.json
          url = dotabuff_abilities_url;
          console.log("Get data from " + url + "...");
          request(url, function(error, response, data) {
            if (error) {
              console.log(error);
            }
            if (response.statusCode !== 200) {
              console.log(response.statusCode);
            }
            data = JSON.parse(data);
            // abilities.forEach(function(ability, index) {
            for (var key in abilities) {
              if (data.DOTAAbilities[key] && data.DOTAAbilities[key].ID) {
                abilities[key].id = data.DOTAAbilities[key].ID;
              }
            }
            // });
            // Get information of each hero from https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_heroes.json
            url = dotabuff_heroes_url;
            console.log("Get data from " + url + "...");
            request(url, function(error, response, data) {
              if (error) {
                return console.log(error);
              }
              if (response.statusCode !== 200) {
                return console.log(response.statusCode);
              }
              // console.log("Getting data from " + url + " is done!");
              data = JSON.parse(data);
              heroes.forEach(function(hero, index) {
                if (data.DOTAHeroes[hero.name]) {
                  if (data.DOTAHeroes[hero.name].ArmorPhysical)
                    heroes[index].armorPhysical = Number(data.DOTAHeroes[hero.name].ArmorPhysical);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].ArmorPhysical)
                    heroes[index].armorPhysical = Number(data.DOTAHeroes["npc_dota_hero_base"].ArmorPhysical);

                  if (data.DOTAHeroes[hero.name].MagicalResistance)
                    heroes[index].magicalResistance = Number(data.DOTAHeroes[hero.name].MagicalResistance);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].MagicalResistance)
                    heroes[index].magicalResistance = Number(data.DOTAHeroes["npc_dota_hero_base"].MagicalResistance);

                  if (data.DOTAHeroes[hero.name].AttackDamageMin)
                    heroes[index].attackDamageMin = Number(data.DOTAHeroes[hero.name].AttackDamageMin);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttackDamageMin)
                    heroes[index].attackDamageMin = Number(data.DOTAHeroes["npc_dota_hero_base"].AttackDamageMin);

                  if (data.DOTAHeroes[hero.name].AttackDamageMax)
                    heroes[index].attackDamageMax = Number(data.DOTAHeroes[hero.name].AttackDamageMax);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttackDamageMax)
                    heroes[index].attackDamageMax = Number(data.DOTAHeroes["npc_dota_hero_base"].AttackDamageMax);

                  if (data.DOTAHeroes[hero.name].AttackRate)
                    heroes[index].attackRate = Number(data.DOTAHeroes[hero.name].AttackRate);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttackRate)
                    heroes[index].attackRate = Number(data.DOTAHeroes["npc_dota_hero_base"].AttackRate);

                  if (data.DOTAHeroes[hero.name].AttackAnimationPoint)
                    heroes[index].attackAnimationPoint = Number(data.DOTAHeroes[hero.name].AttackAnimationPoint);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttackAnimationPoint)
                    heroes[index].attackAnimationPoint = Number(data.DOTAHeroes["npc_dota_hero_base"].AttackAnimationPoint);

                  if (data.DOTAHeroes[hero.name].AttackAcquisitionRange)
                    heroes[index].attackAcquisitionRange = Number(data.DOTAHeroes[hero.name].AttackAcquisitionRange);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttackAcquisitionRange)
                    heroes[index].attackAcquisitionRange = Number(data.DOTAHeroes["npc_dota_hero_base"].AttackAcquisitionRange);

                  if (data.DOTAHeroes[hero.name].AttackRange)
                    heroes[index].attackRange = Number(data.DOTAHeroes[hero.name].AttackRange);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttackRange)
                    heroes[index].attackRange = Number(data.DOTAHeroes["npc_dota_hero_base"].AttackRange);

                  if (data.DOTAHeroes[hero.name].AttributePrimary) {
                    switch (data.DOTAHeroes[hero.name].AttributePrimary) {
                      case "DOTA_ATTRIBUTE_STRENGTH":
                        heroes[index].attributePrimary = "STRENGTH";
                        break;
                      case "DOTA_ATTRIBUTE_AGILITY":
                        heroes[index].attributePrimary = "AGILITY";
                        break;
                      case "DOTA_ATTRIBUTE_INTELLECT":
                        heroes[index].attributePrimary = "INTELLECT";
                        break;
                      default:
                        heroes[index].attributePrimary = "Unknown";
                        break;
                    }
                  }

                  if (data.DOTAHeroes[hero.name].AttributeBaseStrength)
                    heroes[index].attributeBaseStrength = Number(data.DOTAHeroes[hero.name].AttributeBaseStrength);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttributeBaseStrength)
                    heroes[index].attributeBaseStrength = Number(data.DOTAHeroes["npc_dota_hero_base"].AttributeBaseStrength);

                  if (data.DOTAHeroes[hero.name].AttributeStrengthGain)
                    heroes[index].attributeStrengthGain = Number(data.DOTAHeroes[hero.name].AttributeStrengthGain);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttributeStrengthGain)
                    heroes[index].attributeStrengthGain = Number(data.DOTAHeroes["npc_dota_hero_base"].AttributeStrengthGain);

                  if (data.DOTAHeroes[hero.name].AttributeBaseIntelligence)
                    heroes[index].attributeBaseIntelligence = Number(data.DOTAHeroes[hero.name].AttributeBaseIntelligence);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttributeBaseIntelligence)
                    heroes[index].attributeBaseIntelligence = Number(data.DOTAHeroes["npc_dota_hero_base"].AttributeBaseIntelligence);

                  if (data.DOTAHeroes[hero.name].AttributeIntelligenceGain)
                    heroes[index].attributeIntelligenceGain = Number(data.DOTAHeroes[hero.name].AttributeIntelligenceGain);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttributeIntelligenceGain)
                    heroes[index].attributeIntelligenceGain = Number(data.DOTAHeroes["npc_dota_hero_base"].AttributeIntelligenceGain);

                  if (data.DOTAHeroes[hero.name].AttributeBaseAgility)
                    heroes[index].attributeBaseAgility = Number(data.DOTAHeroes[hero.name].AttributeBaseAgility);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttributeBaseAgility)
                    heroes[index].attributeBaseAgility = Number(data.DOTAHeroes["npc_dota_hero_base"].AttributeBaseAgility);

                  if (data.DOTAHeroes[hero.name].AttributeAgilityGain)
                    heroes[index].attributeAgilityGain = Number(data.DOTAHeroes[hero.name].AttributeAgilityGain);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].AttributeAgilityGain)
                    heroes[index].attributeAgilityGain = Number(data.DOTAHeroes["npc_dota_hero_base"].AttributeAgilityGain);

                  if (data.DOTAHeroes[hero.name].MovementSpeed)
                    heroes[index].movementSpeed = Number(data.DOTAHeroes[hero.name].MovementSpeed);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].MovementSpeed)
                    heroes[index].movementSpeed = Number(data.DOTAHeroes["npc_dota_hero_base"].MovementSpeed);

                  if (data.DOTAHeroes[hero.name].MovementTurnRate)
                    heroes[index].movementTurnRate = Number(data.DOTAHeroes[hero.name].MovementTurnRate);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].MovementTurnRate)
                    heroes[index].movementTurnRate = Number(data.DOTAHeroes["npc_dota_hero_base"].MovementTurnRate);

                  if (data.DOTAHeroes[hero.name].VisionDaytimeRange)
                    heroes[index].visionDaytimeRange = Number(data.DOTAHeroes[hero.name].VisionDaytimeRange);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].VisionDaytimeRange)
                    heroes[index].visionDaytimeRange = Number(data.DOTAHeroes["npc_dota_hero_base"].VisionDaytimeRange);

                  if (data.DOTAHeroes[hero.name].VisionNighttimeRange)
                    heroes[index].visionNighttimeRange = Number(data.DOTAHeroes[hero.name].VisionNighttimeRange);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].VisionNighttimeRange)
                    heroes[index].visionNighttimeRange = Number(data.DOTAHeroes["npc_dota_hero_base"].VisionNighttimeRange);

                  if (data.DOTAHeroes[hero.name].Role)
                    heroes[index].role = data.DOTAHeroes[hero.name].Role;

                  if (data.DOTAHeroes[hero.name].Team) {
                    switch (data.DOTAHeroes[hero.name].Team) {
                      case "Good":
                        heroes[index].team = "Radiant";
                        break;
                      case "Bad":
                        heroes[index].team = "Dire";
                        break;
                      default:
                        heroes[index].team = "Unknown";
                        break;
                    }
                  }

                  if (data.DOTAHeroes[hero.name].Legs)
                    heroes[index].legs = Number(data.DOTAHeroes[hero.name].Legs);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].Legs)
                    heroes[index].legs = Number(data.DOTAHeroes["npc_dota_hero_base"].Legs);

                  if (data.DOTAHeroes[hero.name].StatusHealth)
                    heroes[index].statusHealth = Number(data.DOTAHeroes[hero.name].StatusHealth);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].StatusHealth)
                    heroes[index].statusHealth = Number(data.DOTAHeroes["npc_dota_hero_base"].StatusHealth);

                  if (data.DOTAHeroes[hero.name].StatusHealthRegen)
                    heroes[index].statusHealthRegen = Number(data.DOTAHeroes[hero.name].StatusHealthRegen);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].StatusHealthRegen)
                    heroes[index].statusHealthRegen = Number(data.DOTAHeroes["npc_dota_hero_base"].StatusHealthRegen);

                  if (data.DOTAHeroes[hero.name].StatusMana)
                    heroes[index].statusMana = Number(data.DOTAHeroes[hero.name].StatusMana);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].StatusMana)
                    heroes[index].statusMana = Number(data.DOTAHeroes["npc_dota_hero_base"].StatusMana);

                  if (data.DOTAHeroes[hero.name].StatusManaRegen)
                    heroes[index].statusManaRegen = Number(data.DOTAHeroes[hero.name].StatusManaRegen);
                  else if (data.DOTAHeroes["npc_dota_hero_base"].StatusManaRegen)
                    heroes[index].statusManaRegen = Number(data.DOTAHeroes["npc_dota_hero_base"].StatusManaRegen);

                  // Find key in format "Ability[1-9]"
                  for (var key in data.DOTAHeroes[hero.name]) {
                    if (data.DOTAHeroes[hero.name].hasOwnProperty(key)) {
                      if (/Ability[1-9]/.test(key)) {
                        var ability = new Ability();
                        ability.name = data.DOTAHeroes[hero.name][key];
                        // "_md.png" 64x64
                        // "_hp1.png" 90x90
                        // "_hp2.png" 105x105
                        if (ability.name.toLowerCase().search("special_bonus_") === (-1)) {
                          ability.icon_url = dota2_base_image_url_abilities + ability.name + "_md.png";
                          ability.portrait_url = dota2_base_image_url_abilities + ability.name + "_hp2.png"
                        }
                        if (abilities[data.DOTAHeroes[hero.name][key]] && abilities[data.DOTAHeroes[hero.name][key]].dname) {
                          ability.id = abilities[ability.name].id;
                          ability.key = key;
                          ability.full_name = abilities[ability.name].dname;
                          ability.description = stripHTML(abilities[ability.name].desc);
                          ability.affects = stripHTML(abilities[ability.name].affects);
                          ability.damage = stripHTML(abilities[ability.name].dmg);
                          ability.attribute = stripHTML(abilities[ability.name].attrib);
                          ability.cooldownAndManacost = stripHTML(abilities[ability.name].cmb);
                          ability.notes = stripHTML(abilities[ability.name].notes);
                          ability.lore = stripHTML(abilities[ability.name].lore);
                        } else if (ability.name === "special_bonus_unique_invoker_3") {
                          // TODO: There is an issue with Invoker. There is no description of special_bonus_unique_invoker_3 in http://www.dota2.com/jsfeed/abilitydata
                          ability.id = data.DOTAHeroes[hero.name][key].ID;
                          ability.key = key;
                          ability.full_name = "-15s Tornado Cooldown";
                        } else {
                          // console.log(ability.name);
                        }
                        heroes[index].abilities.push(ability);
                      }
                    }
                  }
                }
              });
              counter--;
              if (counter == 0) {
                // returnJSON(res, heroes);
                // heroes_data = heroes;
                saveFile(heroes_json_file, JSON.stringify(heroes));
              }
            });
          });
        });
      }
    }
  });
}

function collectItems() {
  // Get items from dota 2 web api to ensure information is newest
  var url = dota2_webapi_url_items;
  console.log("Get data from " + url + "...");
  request(url, function(error, response, data) {
    if (error) {
      return console.log(error);
    }
    if (response.statusCode !== 200) {
      return console.log(response.statusCode);
    }
    data = JSON.parse(data);
    if (data.result.status === 200) {
      // Reset item list
      var items = [];
      for (var record of data.result.items) {
        var item = new Item();
        item.id = record.id
        item.name = record.name;
        item.short_name = record.name.replace("item_", "");
        item.localized_name = record.localized_name;
        item.icon_url = dota2_base_image_url_items + item.short_name + "_lg.png";
        item.portrait_url = item.icon_url;
        item.cost = record.cost;
        if (record.recipe) {
          item.isRecipe = true;
        } else {
          item.isRecipe = false;
        }
        if (record.secret_shop) {
          item.inSecretShop = true;
        } else {
          item.inSecretShop = false;
        }
        if (record.side_shop) {
          item.inSideShop = true;
        } else {
          item.inSideShop = false;
        }

        items.push(item);
      }

      // Ensure there is at least one item
      if (items.length) {
        var counter = 2;
        // Get information of items from http://www.dota2.com/jsfeed/itemdata
        url = jsfeed_itemdata_url;
        console.log("Get data from " + url + "...");
        request(url, function(error, response, data) {
          if (error) {
            console.log(error);
            saveFile(items_json_file, items);
            return;
          }
          if (response.statusCode !== 200) {
            console.log(response.statusCode);
            saveFile(items_json_file, items);
            return;
          }
          data = JSON.parse(data);
          items.forEach(function(item, index) {
            if (data.itemdata[item.short_name]) {
              items[index].description.text = stripHTML(data.itemdata[item.short_name].desc);
              items[index].attribute = stripHTML(data.itemdata[item.short_name].attrib);
              if (data.itemdata[item.short_name].mc)
                items[index].manacost = Number(data.itemdata[item.short_name].mc);
              if (data.itemdata[item.short_name].cd)
                items[index].cooldown = Number(data.itemdata[item.short_name].cd);
              items[index].notes = stripHTML(data.itemdata[item.short_name].notes);
              items[index].lore = stripHTML(data.itemdata[item.short_name].lore);
            }
          });
          counter--;
          if (counter == 0) {
            items.forEach(function(item, index) {
              // Replace parameters in description with corresponding values
              // console.log(items[index].description.text);
              items[index].description = items[index].description.text.replace(
                /(%[^%]*%)/g,
                function(match, p1, offset, string) {
                  if (items[index].description.parameters[p1]) {
                    return match.replace(match, items[index].description.parameters[p1]);
                  }
                }
              );
            });
            saveFile(items_json_file, JSON.stringify(items));
          }
        });

        url = dotabuff_items_url;
        console.log("Get data from " + url + "...");
        request(url, function(error, response, data) {
          if (error) {
            console.log(error);
            saveFile(items_json_file, items);
            return;
          }
          if (response.statusCode !== 200) {
            console.log(response.statusCode);
            saveFile(items_json_file, items);
            return;
          }
          data = JSON.parse(data);
          items.forEach(function(item, index) {
            if (data.DOTAAbilities[item.name]) {
              if (data.DOTAAbilities[item.name].AbilitySpecial) {
                // console.log(item.name);
                data.DOTAAbilities[item.name].AbilitySpecial.forEach(function(ability, i) {
                  for (var key in ability) {
                    items[index].description.parameters["%" + key +"%"] = ability[key];
                  }
                });
              }
            }
          });
          counter--;
          if (counter == 0) {
            items.forEach(function(item, index) {
              // Replace parameters in description with corresponding values
              // console.log(items[index].description.text);
              items[index].description = items[index].description.text.replace(
                /(%[^%]*%)/g,
                function(match, p1, offset, string) {
                  if (items[index].description.parameters[p1]) {
                    return match.replace(match, items[index].description.parameters[p1]);
                  }
                }
              );
            });
            saveFile(items_json_file, JSON.stringify(items));
          }
        });
      }
    }
  });
}

var express = require('express');
var app = express();
var request = require('request');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// app.get('/', function(request, response) {
//   response.render('pages/index');
// });

// app.get('/heroes', function(req, res) {
//   returnJSON(res, heroes_data);
// });

collectHeroes();
collectItems();

var CronJob = require('cron').CronJob;
var job = new CronJob('00 00 */1 * * *', function() {
    sayHello();
    collectHeroes();
    collectItems();
  }, function () {
    /* This function is executed when the job stops */
    sayBye()
  },
  true, /* Start the job right now */
  'America/Los_Angeles' /* Time zone of this job. */
);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
