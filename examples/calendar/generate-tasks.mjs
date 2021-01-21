export function generateTasks () {
  const tasks = [
    'Get Milk',
    'Phone Mom',
    'Call Work',
    'Run Tests',
    'Investigate Fridge Humming'
  ]
  const n = Math.round(Math.random() * 10)
  return Array(n)
    .fill(0)
    .map(() => ({
      task: tasks[Math.floor(Math.random() * tasks.length)],
      note:
        Math.round(Math.random() * Number.MAX_SAFE_INTEGER) % 7 === 0
          ? loremIpsum
          : null
    }))
}

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam laoreet nisl sit amet dolor condimentum rutrum. Vestibulum et lacus pellentesque mi pretium tempus. Aliquam erat volutpat. Praesent dapibus augue eros, vitae rutrum eros ultrices vel. Integer lobortis, neque eu tincidunt maximus, quam augue sollicitudin risus, sed consequat leo ipsum id enim. Cras orci nibh, ultrices nec lorem nec, interdum suscipit orci. Nulla id felis vel ligula lobortis aliquam vitae finibus odio. Maecenas vitae feugiat erat, eget porttitor arcu. Proin accumsan mauris sit amet lacus efficitur rutrum. Ut at odio in lorem laoreet tincidunt. Integer in neque suscipit, finibus est eu, molestie justo. Curabitur dui arcu, iaculis sit amet sollicitudin quis, tristique quis lectus. Phasellus in suscipit risus. Phasellus in justo vitae quam ullamcorper gravida vel sed elit. Suspendisse eleifend commodo velit nec vestibulum. Aliquam ut mi purus.

Aliquam erat volutpat. Sed semper turpis vitae massa ullamcorper commodo. Praesent aliquam malesuada convallis. Fusce non nibh volutpat, finibus dui vel, laoreet est. Cras consectetur velit massa, sit amet convallis tellus lacinia sit amet. Donec arcu metus, accumsan quis sem ornare, aliquam pulvinar libero. Integer eget sapien eget ipsum venenatis sagittis. Ut sollicitudin, quam vitae dictum commodo, neque urna tempor odio, molestie dictum massa purus nec neque. Cras iaculis dui vitae elit sagittis faucibus. Cras interdum et arcu eu vehicula. Sed sodales pretium nunc, ut finibus mi condimentum in. Duis commodo volutpat tortor, eget porta purus ullamcorper vel. Proin egestas lorem quis orci ultricies tincidunt. Fusce lobortis justo ut dapibus accumsan.

Pellentesque gravida nulla a ornare convallis. Donec luctus accumsan purus vitae pretium. Nullam porta metus et luctus elementum. Cras fermentum, justo eu dapibus sodales, neque mauris dictum ante, at dictum turpis velit non est. Duis ut lacus ex. Nulla posuere quis metus vitae feugiat. Integer varius ultrices tellus vitae tincidunt.

Etiam eu ornare dolor, at elementum dolor. Duis sit amet turpis laoreet, scelerisque libero in, maximus libero. Nullam auctor tincidunt efficitur. In hac habitasse platea dictumst. Nunc nec massa justo. Sed dictum pellentesque nisl, convallis cursus erat tempus sit amet. Duis vitae rutrum eros.`
