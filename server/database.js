module.exports.problems = [
  {
    problemId: 1,
    title: "Hello World",
    difficulty: "Easy",
    desc: {
      info: "print Hello World",
      ex1: "output: Hello World",
      note: "it should complete in O(1), and some info... blala",
    },
    submissions: 12,
    accepted: 10,
    acceptance: "95%",
    template: {
      cpp: [
        {
          DriverStart: `
        #include<bits/stdc++.h>
        using namespace std;
        `,
        },
        {
          DriverEnd: `
        int main(){
            int num1;
            int num2;
            cin>>num1;
            cin>>num2;
            Solution obj;
            int ans = obj.add(num1,num2);
            cout<<ans;
            return 0;
        }
        `,
        },
        {
          Codestart: `
            class Solution{
                public:
                int add(int num1,int num2){
                    //code here
                }
            }
            `,
        },
      ],
      java: [
        {
          DriverStart: `
        import java.util.*;
        import java.io.*;
        import java.lang.*;

        class myapp{
          public static void main(String args[]) throws IOException{
            Scanner sc= new Scanner(System.in); 
            int num1 = sc.nextInt();
            int num2 = sc.nextInt();
            System.out.println(new Solution().add(num1, num2));
          }
        }
        `,
        },
        {
          DriverEnd: `
        `,
        },
        {
          Codestart: `
            class Solution{
                public static Integer add(int num1, int num2){
                  //code here
                }
            }
            `,
        },
      ],
      python: [
        {
          DriverStart: `
        `,
        },
        {
          DriverEnd: `
          if__name__ == "__main__":
            num1 = int(input())
            num2 = int(input())
            ob = Solution()
            print(ob.add(num1,num2))
        `,
        },
        {
          Codestart: `
            class Solution:
              def add(num1,num2):
                #code here
            `,
        },
      ],
    },
    testcases: {
      Visible: [
        {
          input: [2, 3],
          output: 5,
        },
        {
          input: [1, 2],
          output: 3,
        },
      ],
      NotVisible: [
        {
          input: [-2, 3],
          output: 1,
        },
        {
          input: [-1, -2],
          output: -3,
        },
      ],
    },
  },
];
