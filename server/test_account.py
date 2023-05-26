from account import account
import unittest

class TestStringMethods(unittest.TestCase):  
    def testAccCreation(self):
        self.assertEqual(account.newAccount({'identifier': 'test1', 'pw': 'test'}), ('{"message": "Successful"}', 200))

if __name__ == '__main__':
    unittest.main()