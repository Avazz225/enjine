from account import account
import unittest

class TestStringMethods(unittest.TestCase):  
    def testAccCreation(self):
        self.assertEqual(account.accCreation({'identifier': 'testadmin', 'pw': 'test', 'passive':'False', 'specific_properties': {}}), ('{"message": "Successful"}', 200))

if __name__ == '__main__':
    unittest.main()