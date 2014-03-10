var assert = require('assert'),
  ls = require('../lib/lookup_service'),
  Database = require('../lib/database');

const GEO_CITY      = __dirname + '/dbs/GeoIPCity.dat';
const GEO_CITY_V6   = __dirname + '/dbs/GeoIPCityv6.dat';
const GEO_COUNTRY   = __dirname + '/dbs/GeoIP.dat';
const GEO_COUNTRY_V6 = __dirname + '/dbs/GeoIPv6.dat';
const GEO_ASN       = __dirname + '/dbs/GeoIPASNum.dat';
const GEO_ASN_V6    = __dirname + '/dbs/GeoIPASNumv6.dat';


describe('lib/lookup_service', function() {


  describe('init()', function() {

    it('should initialize with single db', function() {
      ls.uninit();
      assert.equal(ls.init(GEO_CITY), true);
    });

    it('should initialize with multiply dbs', function() {
      ls.uninit();
      assert.equal(ls.init([GEO_CITY, GEO_ASN]), true);
    });
  });

  describe('seekCountry()', function() {
    it('should perform binary search', function() {
      var db = new Database(GEO_CITY);
      assert.equal(ls.seekCountry(db, 3276048658), 2854053);
      assert.equal(ls.seekCountry(db, 3539625160), 2779115);
    });
  });

  describe('getCountry()', function() {
    before(function() {
      assert.equal(ls.init(GEO_COUNTRY), true);
    });

    it('should return country by ip', function() {
      assert.deepEqual(ls.getCountry('109.60.171.33'), {name: 'Russian Federation', code: 'RU'});
      assert.deepEqual(ls.getCountry('210.250.100.200'), {name: 'Japan', code: 'JP'});
      assert.deepEqual(ls.getCountry('1.2.1.1'), {name: 'China', code: 'CN'});
    });

    it('should return unknown country by unknown ip', function() {
      var c = ls.getCountry('blahblah');
      assert.equal(c.name, 'N/A');
      assert.equal(c.code, '--');
    });
  });


  describe('seekCountryV6()', function() {

    it('should return correct index', function() {
      var db = new Database(GEO_COUNTRY_V6);

      assert.equal(ls.seekCountryV6(db, '2001:0db8:85a3:0042:1000:8a2e:0370:7334'), 0xffff00);
      assert.equal(ls.seekCountryV6(db, '2001:4860:0:1001::68'), 0xffff00);
      assert.equal(ls.seekCountryV6(db, '::64.17.254.216'), 0xffffe1);
      assert.equal(ls.seekCountryV6(db, '::ffff:64.17.254.216'), 0xffffe1);
      assert.equal(ls.seekCountryV6(db, '2001:200::'), 0xffff6f);
    });
  });


  describe('getCountryV6()', function() {
    before(function() {
      assert.equal(ls.init(GEO_COUNTRY_V6), true);
    });

    it('should return country by ip', function() {
      assert.deepEqual(ls.getCountryV6('::64.17.254.216'), {code: 'US', name: 'United States'});
      assert.deepEqual(ls.getCountryV6('2001:200::'), {code: 'JP', name: 'Japan'});
    });

    it('should return unknown country by unknown ip', function() {
      assert.deepEqual(ls.getCountryV6('blahblah'), {name: 'N/A', code: '--'});
    });
  });


  describe('getLocation()', function() {
    before(function() {
      assert.equal(ls.init(GEO_CITY), true);
    });

    it('should return location by ip', function() {
      var l = ls.getLocation('109.60.171.33');
      assert.equal(l.countryCode, 'RU');
      assert.equal(l.countryName, 'Russian Federation');
      assert.equal(l.region, '48');
      assert.equal(l.regionName, 'Moscow City');
      assert.equal(l.city, 'Moscow');
      assert.equal(l.latitude, 55.75219999999999);
      assert.equal(l.longitude, 37.6156);
      assert.equal(l.metroCode, 0);
      assert.equal(l.dmaCode, 0);
      assert.equal(l.areaCode, 0);
    });

    it('should return proper info for non-latin names', function() {
      var l = ls.getLocation('194.181.164.72');

      assert.equal(l.countryCode, 'PL');
      assert.equal(l.countryName, 'Poland');
      assert.equal(l.region, '77');
      assert.equal(l.regionName, 'Malopolskie');
      assert.equal(l.city, 'Kraków');
      assert.equal(l.latitude, 50.08330000000001);
      assert.equal(l.longitude, 19.91669999999999);
      assert.equal(l.metroCode, 0);
      assert.equal(l.dmaCode, 0);
      assert.equal(l.areaCode, 0);
    });

    it('should return location by ip (2)', function() {
      var l = ls.getLocation('195.68.137.18');
      assert.equal(l.countryCode, 'RU');
      assert.equal(l.countryName, 'Russian Federation');
      assert.equal(l.region, null);
      assert.equal(l.regionName, null);
      assert.equal(l.city, null);
      assert.equal(l.latitude, 60);
      assert.equal(l.longitude, 100);
      assert.equal(l.metroCode, 0);
      assert.equal(l.dmaCode, 0);
      assert.equal(l.areaCode, 0);
    });

    it('should return location by ip (3)', function() {
      var l = ls.getLocation('2.2.3.29');
      assert.equal(l.countryCode, 'FR');
      assert.equal(l.countryName, 'France');
      assert.equal(l.region, 'A2');
      assert.equal(l.regionName, 'Bretagne');
      assert.equal(l.city, 'Rennes');
      assert.equal(l.latitude, 48.111999999999995);
      assert.equal(l.longitude, -1.6742999999999881);
      assert.equal(l.metroCode, 0);
      assert.equal(l.dmaCode, 0);
      assert.equal(l.areaCode, 0);
    });

    it('should return location by ip (4)', function() {
      var l = ls.getLocation('180.189.170.18');
      assert.equal(l.countryCode, 'TL');
      assert.equal(l.countryName, 'Timor-Leste');
      assert.equal(l.region, null);
      assert.equal(l.regionName, null);
      assert.equal(l.city, null);
      assert.equal(l.latitude, -8.569999999999993);
      assert.equal(l.longitude, 125.57);
      assert.equal(l.metroCode, 0);
      assert.equal(l.dmaCode, 0);
      assert.equal(l.areaCode, 0);
    });
  });


  describe('getOrganization()', function() {
    before(function() {
      assert.equal(ls.init(GEO_ASN), true);
    });

    it('should return ISP by ip', function() {
      assert.equal(ls.getOrganization('109.60.171.33'), 'AS47241 CJSC "Ivtelecom"');
      assert.equal(ls.getOrganization('64.4.4.4'), 'AS8075 Microsoft Corp');
      assert.equal(ls.getOrganization('210.250.100.200'), 'AS2527 So-net Entertainment Corporation');
    });

    it('should work fine with utf8', function() {
      assert.equal(ls.getOrganization('189.63.71.77'), 'AS28573 Serviços de Comunicação S.A.');
    });
  });


  describe('getOrganizationV6()', function() {
    before(function() {
      assert.equal(ls.init(GEO_ASN_V6), true);
    });

    it('should return ISP by ip', function() {
      assert.equal(ls.getOrganizationV6('2001:0db8:85a3:0042:1000:8a2e:0370:7334'), null);
      assert.equal(ls.getOrganizationV6('2001:4860:0:1001::68'), 'AS15169 Google Inc.');
      assert.equal(ls.getOrganizationV6('::64.17.254.216'), 'AS33224 Towerstream I, Inc.');
      assert.equal(ls.getOrganizationV6('::ffff:64.17.254.216'), 'AS33224 Towerstream I, Inc.');
      assert.equal(ls.getOrganizationV6('2001:200::'), 'AS2500 WIDE Project');
    });

  });

});
